import * as vscode from 'vscode';

export interface GeneratedPrompt {
  technique: string;
  original: string;
  generated: string;
  instructions: string;
  confidence: number;
}

export const PROMPT_TECHNIQUES = [
  'Expert Prompt',
  'Emotion Prompt',
  'Thread of Thought Prompt',
  'Chain of Verification Prompt',
  'Zero-Shot Prompt',
  'Role-Based Prompt',
  'Instructional Prompt',
  'Code Generation Prompt',
  'Formatting Prompt',
  'Analytical Prompt',
  'Test Case Prompt'
];

export class PromptGenerator {
  private static readonly TECHNIQUE_TEMPLATES: Record<string, string> = {
    'Expert Prompt': `You are an expert developer with deep knowledge in [DOMAIN]. 
Analyze the following request and provide a detailed, professional response based on industry best practices:
"{INPUT}"

Provide:
- Expert analysis and insights
- Best practices and patterns
- Potential edge cases to consider
- Implementation recommendations`,

    'Emotion Prompt': `Imagine you are passionate about solving this problem. 
Consider the emotional context and user experience implications:
"{INPUT}"

Analyze:
- How might users feel about this solution?
- What emotional intelligence is needed?
- How does this impact user satisfaction?`,

    'Thread of Thought Prompt': `Let me think through this step-by-step:
1. First, consider: "{INPUT}"
2. Break down the problem into components
3. Trace through the logic path
4. Verify each assumption
5. Draw conclusions

Please work through this reasoning process:`,

    'Chain of Verification Prompt': `Verify this step-by-step:
"{INPUT}"

For each step:
1. Is this assumption valid?
2. Can this be proven?
3. What evidence supports this?
4. What could invalidate this?
5. What's the confidence level?

Provide verification chain:`,

    'Zero-Shot Prompt': `Without any prior examples, solve this:
"{INPUT}"

Use only:
- Your general knowledge
- Logical reasoning
- Domain understanding
- No reference examples

Direct answer:`,

    'Role-Based Prompt': `You are a [ROLE] tasked with addressing this:
"{INPUT}"

As a [ROLE], your perspective is:
- Priorities and constraints
- Expertise and knowledge
- Best practices in your field
- Potential solutions from your viewpoint`,

    'Instructional Prompt': `Create clear, step-by-step instructions for:
"{INPUT}"

Format as:
1. Prerequisites/Setup
2. Step-by-step process
3. Expected outcomes
4. Troubleshooting tips
5. Best practices

Instructions:`,

    'Code Generation Prompt': `Generate production-ready code that:
"{INPUT}"

Requirements:
- Follow best practices
- Include error handling
- Add comprehensive comments
- Consider performance
- Ensure readability

Code:`,

    'Formatting Prompt': `Format and structure the following into:
"{INPUT}"

Apply:
- Clear hierarchy
- Consistent styling
- Proper organization
- Readability improvements
- Standard conventions

Formatted output:`,

    'Analytical Prompt': `Analyze this thoroughly:
"{INPUT}"

Provide:
- Root cause analysis
- Pattern identification
- Data-driven insights
- Trend analysis
- Key findings with evidence`,

    'Test Case Prompt': `Generate comprehensive test cases for:
"{INPUT}"

Include:
- Happy path scenarios
- Edge cases
- Error conditions
- Boundary values
- Integration tests

Test cases:`
  };

  constructor(private configManager: any) {}

  /**
   * Generate 4 dynamic variations of the same technique
   */
  async generateVariations(
    technique: string,
    userInput: string,
    context?: {
      selectedCode?: string;
      fileType?: string;
      fileName?: string;
      domain?: string;
      role?: string;
    }
  ): Promise<GeneratedPrompt[]> {
    const variations: GeneratedPrompt[] = [];
    
    for (let i = 0; i < 4; i++) {
      // Mix deterministic seed with random element for diversity
      const randomOffset = Math.random() * 100;
      const variation = await this.generatePrompt(
        technique,
        userInput,
        context,
        i // seed for randomization (0, 1, 2, 3)
      );
      variations.push(variation);
    }
    
    return variations;
  }

  /**
   * Generate a dynamic prompt based on technique and user input
   */
  async generatePrompt(
    technique: string,
    userInput: string,
    context?: {
      selectedCode?: string;
      fileType?: string;
      fileName?: string;
      domain?: string;
      role?: string;
    },
    variationSeed: number = 0
  ): Promise<GeneratedPrompt> {
    // Only declare these variables once
    const _template = PROMPT_TECHNIQUES.includes(technique)
      ? technique
      : PROMPT_TECHNIQUES[0];

    let baseTemplate = PromptGenerator.TECHNIQUE_TEMPLATES[_template];

    const domain = context?.domain || this.inferDomain(userInput, context);
    const role = context?.role || this.inferRole(_template);
    const fileType = context?.fileType || 'code';

    const variationInstructions = this.generateVariationInstructions(_template, variationSeed);

    // Helper for shuffling array based on seed
    function seededShuffle<T>(array: T[], seed: number): T[] {
      let arr = array.slice();
      let m = arr.length, t, i;
      let s = seed + 1;
      while (m) {
        i = Math.floor(Math.abs(Math.sin(s++) * 10000) % m--);
        t = arr[m];
        arr[m] = arr[i];
        arr[i] = t;
      }
      return arr;
    }

    // Aggressive variation logic: each variation is a new prompt structure or sub-task
    let generatedPrompt = '';
    // Variation blueprints for each technique
    const promptBlueprints: Record<string, ((input: string, domain: string, role: string, fileType: string, seed: number) => string)[]> = {
      'Expert Prompt': [
        (input, domain, role, fileType, seed) => `As a ${role} in ${domain}, analyze: "${input}"\n\n✓ List 3 best practices\n✓ Identify a common pitfall\n✓ Suggest a novel approach`,
        (input, domain, role, fileType, seed) => `You are a ${role}. For the following challenge in ${domain}: "${input}"\n\nProvide:\n1. A step-by-step solution\n2. A checklist for review\n3. A warning about what to avoid`,
        (input, domain, role, fileType, seed) => `Given the task: "${input}"\n\nWrite as a ${role}:\n- A summary of the problem\n- 2+ alternative solutions\n- A clarifying question about requirements`,
        (input, domain, role, fileType, seed) => `Imagine you are mentoring a junior ${role} in ${domain}. For: "${input}"\n\nExplain:\n- The reasoning behind your approach\n- A real-world example\n- A tip for long-term maintainability`
      ],
      'Emotion Prompt': [
        (input, domain, role, fileType, seed) => `Describe how users might feel about: "${input}"\n\n- List 2 positive emotions and 2 negative emotions\n- Suggest a way to improve user satisfaction\n- What would delight the user?`,
        (input, domain, role, fileType, seed) => `For the scenario: "${input}"\n\nAnalyze:\n- Emotional impact on each stakeholder\n- A possible emotional conflict\n- How to resolve it with empathy`,
        (input, domain, role, fileType, seed) => `Imagine a user is frustrated by: "${input}"\n\n- What could cause this frustration?\n- How would you redesign for delight?\n- What feedback would validate your solution?`,
        (input, domain, role, fileType, seed) => `Consider the emotional journey for: "${input}"\n\n- Map the highs and lows\n- What moments are critical?\n- Suggest a feature to boost positive feelings`
      ],
      'Thread of Thought Prompt': [
        (input, domain, role, fileType, seed) => `Think aloud about: "${input}"\n\n1. First consideration\n2. Next logical step\n3. Potential obstacles\n4. How to overcome them\n5. Final conclusion`,
        (input, domain, role, fileType, seed) => `For the problem: "${input}"\n\nBreak it into logical steps:\n- List each step\n- State one assumption per step\n- Note dependencies`,
        (input, domain, role, fileType, seed) => `Given: "${input}", what are 3 possible approaches?\n\nFor each:\n- Pros and cons\n- Resource requirements\n- Risk assessment`,
        (input, domain, role, fileType, seed) => `Explain your thought process for: "${input}"\n\nShow your work:\n- What you considered first\n- How thinking evolved\n- What question remains unanswered`
      ],
      'Chain of Verification Prompt': [
        (input, domain, role, fileType, seed) => `Verify the following: "${input}"\n\n- List each assumption\n- For each, state how you would test it\n- What would disprove it?`,
        (input, domain, role, fileType, seed) => `For: "${input}"\n\nCreate a verification checklist:\n- At each step, what must be true?\n- How would you confirm?\n- What's your confidence level?`,
        (input, domain, role, fileType, seed) => `Given: "${input}"\n\nWhat evidence would prove success?\n- At least 3 types of evidence\n- How to measure each\n- What would constitute failure?`,
        (input, domain, role, fileType, seed) => `Imagine a failure scenario in: "${input}"\n\n- What would you check first?\n- How to isolate the root cause?\n- How to prevent recurrence?`
      ],
      'Zero-Shot Prompt': [
        (input, domain, role, fileType, seed) => `Without examples, answer: "${input}"\n\n- Your answer\n- Your justification\n- Why this is the best approach`,
        (input, domain, role, fileType, seed) => `For: "${input}"\n\nUse only general knowledge:\n- The solution\n- Core principles applied\n- Why these principles work here`,
        (input, domain, role, fileType, seed) => `Given: "${input}"\n\nWhat is the most logical approach?\n- Explain your reasoning\n- What assumptions are you making?\n- How would you validate them?`,
        (input, domain, role, fileType, seed) => `Solve: "${input}"\n\nWithout reference cases:\n- Your solution\n- State your key assumptions\n- What would change your answer?`
      ],
      'Role-Based Prompt': [
        (input, domain, role, fileType, seed) => `As a ${role}, how would you approach: "${input}"?\n\n- Your priorities\n- Key constraints you'd consider\n- Recommended solution`,
        (input, domain, role, fileType, seed) => `For the role of ${role}, analyze: "${input}"\n\n- What constraints are unique to this role?\n- Best practices from your field\n- How this differs from other perspectives`,
        (input, domain, role, fileType, seed) => `Imagine you are a ${role} in ${domain}.\n\nFor: "${input}"\n- How would you solve this?\n- What best practice would you apply?\n- What would you warn about?`,
        (input, domain, role, fileType, seed) => `Given: "${input}"\n\nWhat would a ${role} do differently from a generalist?\n- Specialized approach\n- Industry-specific practices\n- Advanced techniques only a ${role} would know`
      ],
      'Instructional Prompt': [
        (input, domain, role, fileType, seed) => `Write step-by-step instructions for: "${input}"\n\n1. Prerequisites/Setup\n2. Steps\n3. Expected result\n4. Troubleshooting tip`,
        (input, domain, role, fileType, seed) => `For: "${input}"\n\nCreate a completion checklist:\n- Items to prepare\n- Actions to take\n- Success criteria\n- Common mistakes to avoid`,
        (input, domain, role, fileType, seed) => `Describe how to accomplish: "${input}"\n\n- Begin with overview\n- Detailed process\n- List common mistakes\n- Summary of expected results`,
        (input, domain, role, fileType, seed) => `Explain the process for: "${input}"\n\n- Prerequisites\n- Step-by-step walkthrough\n- Decision points\n- How to verify success`
      ],
      'Code Generation Prompt': [
        (input, domain, role, fileType, seed) => `Write code in ${fileType} to: "${input}"\n\nRequirements:\n- Add comments for each major step\n- Include error handling\n- Optimize for readability`,
        (input, domain, role, fileType, seed) => `For: "${input}"\n\nGenerate a function in ${fileType}:\n- Clear function signature\n- Comprehensive comments\n- Error handling\n- Example usage`,
        (input, domain, role, fileType, seed) => `Create a code snippet for: "${input}" in ${fileType}.\n\n- Optimize for readability\n- Include edge case handling\n- Add type hints/annotations if applicable`,
        (input, domain, role, fileType, seed) => `Develop a reusable module for: "${input}"\n\n- Well-documented API\n- Production-ready quality\n- Examples of how to use\n- Testing considerations`
      ],
      'Formatting Prompt': [
        (input, domain, role, fileType, seed) => `Format the following for clarity: "${input}"\n\n- Use bullet points\n- Hierarchical structure\n- Emphasis on key items`,
        (input, domain, role, fileType, seed) => `For: "${input}"\n\nCreate a structured summary:\n- Use a table or list\n- Highlight key points\n- Add a summary sentence`,
        (input, domain, role, fileType, seed) => `Rewrite: "${input}"\n\n- Emphasize structure and hierarchy\n- Use formatting for clarity\n- Make it scannable`,
        (input, domain, role, fileType, seed) => `Organize: "${input}"\n\n- Add headings and subheadings\n- Use consistent formatting\n- Group related information`
      ],
      'Analytical Prompt': [
        (input, domain, role, fileType, seed) => `Analyze: "${input}"\n\n- Identify the root cause\n- What patterns emerge?\n- What data supports your conclusion?`,
        (input, domain, role, fileType, seed) => `For: "${input}"\n\nProvide deep analysis:\n- List 3 key data points\n- What does each reveal?\n- What's the bigger picture?`,
        (input, domain, role, fileType, seed) => `Given: "${input}"\n\nWhat trends can you infer?\n- Support with reasoning\n- What's predictable?\n- What's uncertain?`,
        (input, domain, role, fileType, seed) => `Break down: "${input}"\n\nAnalyze thoroughly:\n- Root causes\n- Contributing factors\n- Evidence for each claim`
      ],
      'Test Case Prompt': [
        (input, domain, role, fileType, seed) => `Write 3 test cases for: "${input}"\n\n- A happy path scenario\n- An edge case\n- An error condition`,
        (input, domain, role, fileType, seed) => `For: "${input}"\n\nDesign a test plan:\n- Normal conditions\n- Error conditions\n- Boundary values`,
        (input, domain, role, fileType, seed) => `Given: "${input}"\n\nWhat boundary values should be tested?\n- Min/max values\n- Empty/null cases\n- Large/complex data`,
        (input, domain, role, fileType, seed) => `Create tests for: "${input}"\n\n- Unit tests\n- Integration tests\n- Expected outputs for each`
      ]
    };

    // Pick blueprint for this variation with randomization
    const blueprints = promptBlueprints[_template] || [
      (input, domain, role, fileType, seed) => baseTemplate.replace(/{INPUT}/g, input).replace(/\[DOMAIN\]/g, domain).replace(/\[ROLE\]/g, role).replace(/\[FILE_TYPE\]/g, fileType)
    ];
    
    // Use random seed mixed with variationSeed for different results each time
    const randomSeed = Math.floor(Math.random() * blueprints.length);
    const selectedBlueprintIndex = (variationSeed + randomSeed) % blueprints.length;
    const blueprint = blueprints[selectedBlueprintIndex];
    generatedPrompt = blueprint(userInput, domain, role, fileType, variationSeed);

    // Add dynamic enhancements
    generatedPrompt = this.addDynamicEnhancements(generatedPrompt, _template, variationSeed);
    
    // Add variation-specific framing
    generatedPrompt = this.addVariationFraming(generatedPrompt, _template, variationSeed);

    if (context?.selectedCode) {
      generatedPrompt += `\n\nContext (${fileType}):\n\n${context.selectedCode}\n\n`;
    }

    return {
      technique: _template,
      original: userInput,
      generated: generatedPrompt,
      instructions: variationInstructions,
      confidence: Math.min(this.calculateConfidence(_template, userInput, context) + (variationSeed * 0.02), 0.99)
    };
  }

  /**
   * Generate multiple technique variations
   */
  async generateMultipleTechniques(
    userInput: string,
    context?: any,
    techniques?: string[]
  ): Promise<GeneratedPrompt[]> {
    const techniquesToUse: string[] = techniques || PROMPT_TECHNIQUES;

    const results = await Promise.all(
      techniquesToUse.map((technique: string) =>
        this.generatePrompt(technique, userInput, context)
      )
    );

    return results;
  }

  /**
   * Recommend best technique for input
   */
  recommendTechnique(userInput: string, fileType?: string): string {
    const lower = userInput.toLowerCase();

    // Pattern matching for technique selection
    if (
      lower.includes('test') ||
      lower.includes('verify') ||
      lower.includes('check')
    ) {
      return 'Chain of Verification Prompt';
    }

    if (
      lower.includes('step') ||
      lower.includes('how') ||
      lower.includes('process')
    ) {
      return 'Instructional Prompt';
    }

    if (lower.includes('explain') || lower.includes('understand')) {
      return 'Analytical Prompt';
    }

    if (
      lower.includes('generate') ||
      lower.includes('write') ||
      lower.includes('create')
    ) {
      if (fileType?.includes('code') || fileType?.includes('js')) {
        return 'Code Generation Prompt';
      }
      return 'Expert Prompt';
    }

    if (lower.includes('think') || lower.includes('reason')) {
      return 'Thread of Thought Prompt';
    }

    if (
      lower.includes('test') ||
      lower.includes('case') ||
      lower.includes('scenario')
    ) {
      return 'Test Case Prompt';
    }

    if (lower.includes('format') || lower.includes('structure')) {
      return 'Formatting Prompt';
    }

    // Default to Expert Prompt
    return 'Expert Prompt';
  }

  /**
   * Get technique-specific instructions
   */
  private getInstructions(technique: string): string {
    const instructions: Record<string, string> = {
      'Expert Prompt':
        'Leverage deep expertise and industry best practices for authoritative solutions',
      'Emotion Prompt': 'Consider emotional intelligence and user experience perspectives',
      'Thread of Thought Prompt': 'Work through reasoning step-by-step for clarity',
      'Chain of Verification Prompt': 'Verify each step with evidence and confidence levels',
      'Zero-Shot Prompt': 'Use general knowledge without relying on examples',
      'Role-Based Prompt': 'Adopt a specific professional role for perspective',
      'Instructional Prompt': 'Create clear, actionable step-by-step instructions',
      'Code Generation Prompt': 'Produce production-ready, well-documented code',
      'Formatting Prompt': 'Organize and structure information for clarity',
      'Analytical Prompt': 'Provide data-driven insights and root cause analysis',
      'Test Case Prompt': 'Generate comprehensive test scenarios including edge cases'
    };

    return instructions[technique] || 'Generate a prompt using this technique';
  }

  /**
   * Infer domain from user input and context
   */
  private inferDomain(userInput: string, context?: any): string {
    const lower = userInput.toLowerCase();

    if (lower.includes('react') || lower.includes('javascript')) return 'Frontend Development';
    if (lower.includes('python') || lower.includes('django')) return 'Python Development';
    if (lower.includes('database') || lower.includes('sql')) return 'Database Design';
    if (lower.includes('api') || lower.includes('rest')) return 'API Development';
    if (lower.includes('security') || lower.includes('auth')) return 'Security Engineering';
    if (context?.fileType) return `${context.fileType} Development`;

    return 'Software Development';
  }

  /**
   * Infer role from technique
   */
  private inferRole(technique: string): string {
    const roles: Record<string, string[]> = {
      'Expert Prompt': [
        'Senior Software Architect',
        'Principal Engineer',
        'Staff Engineer',
        'Technical Lead',
        'Industry Consultant',
        'Distinguished Engineer',
        'CTO Advisor',
        'Solution Architect',
        'Engineering Manager',
        'Technology Evangelist',
        'R&D Lead',
        'Platform Architect'
      ],
      'Emotion Prompt': [
        'UX Designer',
        'Product Designer',
        'Empathy Coach',
        'Psychology-Informed Writer',
        'Customer Experience Strategist',
        'Behavioral Researcher',
        'Wellbeing Coach',
        'Human-Centered Designer',
        'User Researcher',
        'Community Manager',
        'Brand Storyteller',
        'Therapeutic Communication Coach'
      ],
      'Thread of Thought Prompt': [
        'Analytical Thinker',
        'Philosophy Professor',
        'Strategy Consultant',
        'Mathematical Problem Solver',
        'Logic Coach',
        'Debate Champion',
        'Critical Thinking Trainer',
        'Systems Thinker',
        'Theoretical Researcher',
        'Cognitive Scientist',
        'Puzzle Solver',
        'Reasoning Specialist'
      ],
      'Chain of Verification Prompt': [
        'QA Engineer',
        'Security Auditor',
        'Code Reviewer',
        'Compliance Analyst',
        'Fact Checker',
        'Risk Analyst',
        'Internal Auditor',
        'Penetration Tester',
        'Governance Specialist',
        'Process Inspector',
        'Quality Manager',
        'Trust & Safety Analyst'
      ],
      'Zero-Shot Prompt': [
        'Generalist Developer',
        'Startup Engineer',
        'Fast Prototyper',
        'Problem Solver',
        'Technical Generalist',
        'Indie Hacker',
        'Product Builder',
        'No-Code Hacker',
        'Rapid Innovator',
        'MVP Specialist',
        'Creative Technologist',
        'Growth Engineer'
      ],
      'Role-Based Prompt': [
        'Domain Specialist',
        'Healthcare Expert',
        'FinTech Consultant',
        'Legal Advisor',
        'Education Specialist',
        'E-commerce Strategist',
        'Marketing Consultant',
        'Supply Chain Analyst',
        'HR Business Partner',
        'Climate Tech Expert',
        'Gaming Industry Expert',
        'Travel Industry Consultant'
      ],
      'Instructional Prompt': [
        'Technical Writer',
        'Documentation Specialist',
        'Course Instructor',
        'Developer Advocate',
        'Curriculum Designer',
        'Online Tutor',
        'Workshop Facilitator',
        'Knowledge Base Manager',
        'Learning Experience Designer',
        'EdTech Content Creator',
        'Training Specialist',
        'Mentor Coach'
      ],
      'Code Generation Prompt': [
        'Senior Software Engineer',
        'Backend Engineer',
        'Frontend Engineer',
        'Full-Stack Developer',
        'Open Source Contributor',
        'API Developer',
        'Mobile App Developer',
        'Cloud Engineer',
        'DevOps Engineer',
        'Game Developer',
        'AI Engineer',
        'Automation Engineer'
      ],
      'Formatting Prompt': [
        'Data Organizer',
        'Information Architect',
        'Technical Editor',
        'Content Strategist',
        'Knowledge Manager',
        'Notion Consultant',
        'Workflow Designer',
        'Digital Librarian',
        'Process Documenter',
        'Operations Manager',
        'Documentation Architect',
        'Content Curator'
      ],
      'Analytical Prompt': [
        'Data Analyst',
        'Data Scientist',
        'Business Analyst',
        'Research Analyst',
        'ML Engineer',
        'Quantitative Analyst',
        'Market Researcher',
        'Product Analyst',
        'Decision Scientist',
        'BI Engineer',
        'Growth Analyst',
        'Statistician'
      ],
      'Test Case Prompt': [
        'Test Engineer',
        'Automation Engineer',
        'SDET',
        'QA Lead',
        'Performance Tester',
        'Load Tester',
        'Reliability Engineer',
        'Bug Hunter',
        'Chaos Engineer',
        'Test Architect',
        'CI/CD Quality Engineer',
        'Release Validator'
      ]
    };

    const roleArray = roles[technique] || ['Expert Developer'];
    // Select a random role from the array
    return roleArray[Math.floor(Math.random() * roleArray.length)];
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(
    technique: string,
    userInput: string,
    context?: any
  ): number {
    let confidence = 0.7; // Base confidence

    // Increase confidence if context is rich
    if (context?.selectedCode) confidence += 0.1;
    if (context?.fileType) confidence += 0.05;
    if (context?.domain) confidence += 0.05;

    // Adjust based on input clarity
    if (userInput.length > 50) confidence += 0.05;
    if (userInput.includes('?')) confidence += 0.03;

    // Technique-specific adjustments
    if (technique === 'Expert Prompt') confidence += 0.05;
    if (technique === 'Code Generation Prompt' && context?.fileType?.includes('code')) {
      confidence += 0.1;
    }

    return Math.min(confidence, 0.99);
  }

  /**
   * Create custom template for new technique
   */
  private createCustomTemplate(technique: string): string {
    return `Apply the "${technique}" technique to:
"{INPUT}"

Follow the principles of this approach and provide a comprehensive response.`;
  }

  /**
   * Validate generated prompt
   */
  validatePrompt(prompt: GeneratedPrompt): { valid: boolean; issues: string[] } {
    const issues: string[] = [];

    if (!prompt.generated || prompt.generated.trim().length === 0) {
      issues.push('Generated prompt is empty');
    }

    if (prompt.generated.length < 20) {
      issues.push('Generated prompt is too short');
    }

    if (prompt.confidence < 0.5) {
      issues.push('Low confidence in generation');
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }

  /**
   * Generate variation-specific instructions for each of the 4 variations
   */
  private generateVariationInstructions(technique: string, seed: number): string {
    const baseInstructions: Record<string, string[]> = {
      'Expert Prompt': [
        'V1: Leverage deep expertise and industry best practices for authoritative solutions',
        'V2: Draw on specialized knowledge and proven methodologies for robust implementation',
        'V3: Apply expert-level analysis with cutting-edge practices and patterns',
        'V4: Use authoritative experience and gold-standard approaches'
      ],
      'Emotion Prompt': [
        'V1: Consider emotional intelligence and user experience perspectives',
        'V2: Evaluate human factors and psychological impact on users',
        'V3: Assess emotional context and stakeholder feelings',
        'V4: Reflect on emotional outcomes and satisfaction drivers'
      ],
      'Thread of Thought Prompt': [
        'V1: Work through reasoning step-by-step for clarity',
        'V2: Trace logic sequentially with explicit reasoning',
        'V3: Build argument progressively with justifications',
        'V4: Connect thoughts linearly for transparent thinking'
      ],
      'Chain of Verification Prompt': [
        'V1: Verify each step with evidence and confidence levels',
        'V2: Validate assumptions with proof points at each stage',
        'V3: Confirm conclusions with supporting evidence throughout',
        'V4: Check validity at every step with certainty metrics'
      ],
      'Zero-Shot Prompt': [
        'V1: Use general knowledge without relying on examples',
        'V2: Apply foundational understanding without reference cases',
        'V3: Leverage inherent knowledge minus demonstrations',
        'V4: Draw from intrinsic expertise without precedents'
      ],
      'Role-Based Prompt': [
        'V1: Adopt a specific professional role for perspective',
        'V2: Take on specialized role identity for viewpoint',
        'V3: Assume professional stance for unique angle',
        'V4: Embody expert persona for specialized insight'
      ],
      'Instructional Prompt': [
        'V1: Create clear, actionable step-by-step instructions',
        'V2: Write explicit, sequential procedural guidance',
        'V3: Develop detailed, comprehensive how-to format',
        'V4: Provide unambiguous, methodical process steps'
      ],
      'Code Generation Prompt': [
        'V1: Produce production-ready, well-documented code',
        'V2: Generate robust code with comprehensive comments',
        'V3: Create optimized, maintainable implementation',
        'V4: Write clean, thoroughly annotated code'
      ],
      'Formatting Prompt': [
        'V1: Organize and structure information for clarity',
        'V2: Format and arrange content for readability',
        'V3: Restructure and layout data logically',
        'V4: Standardize and compose information effectively'
      ],
      'Analytical Prompt': [
        'V1: Provide data-driven insights and root cause analysis',
        'V2: Deliver evidence-based findings and deep investigation',
        'V3: Offer statistical insights with causal analysis',
        'V4: Present fact-based conclusions and origin analysis'
      ],
      'Test Case Prompt': [
        'V1: Generate comprehensive test scenarios including edge cases',
        'V2: Create thorough test coverage with boundary conditions',
        'V3: Develop extensive test plans with corner cases',
        'V4: Design complete test suite with exception handling'
      ]
    };

    const instructions = baseInstructions[technique] || [
      'V1: Generate a prompt using this technique',
      'V2: Generate a prompt using this technique',
      'V3: Generate a prompt using this technique',
      'V4: Generate a prompt using this technique'
    ];

    return instructions[seed % 4];
  }

  /**
   * Add variation-specific framing to the prompt
   */
  private addVariationFraming(generatedPrompt: string, technique: string, seed: number): string {
    const framings: Record<number, string> = {
      0: '\n\n---\n[Variation 1]',
      1: '\n\n---\n[Variation 2 - Alternative Approach]',
      2: '\n\n---\n[Variation 3 - Enhanced Detail]',
      3: '\n\n---\n[Variation 4 - Comprehensive Format]'
    };

    // Add variation prefix
    let framedPrompt = generatedPrompt;

    // Add technique-specific variation modifications
    if (seed === 1) {
      // Variation 2: Ask for alternative perspectives
      framedPrompt += '\n\nProvide alternative viewpoints or approaches beyond the initial solution.';
    } else if (seed === 2) {
      // Variation 3: Add more detail
      framedPrompt += '\n\nInclude more detailed explanations and deeper analysis.';
    } else if (seed === 3) {
      // Variation 4: Comprehensive format
      framedPrompt += '\n\nProvide a comprehensive, well-structured response with all relevant sections.';
    }

    return framedPrompt;
  }

  /**
   * Add dynamic enhancements to make each prompt generation unique
   */
  private addDynamicEnhancements(generatedPrompt: string, technique: string, seed: number): string {
    const enhancements = [
      (p: string) => p + '\n\n💡 Tip: Focus on actionable insights.',
      (p: string) => p + '\n\n⚡ Speed Priority: Provide quick, decisive answers.',
      (p: string) => p + '\n\n🎯 Precision Focus: Be specific and avoid generalizations.',
      (p: string) => p + '\n\n🔍 Deep Dive: Provide comprehensive, thorough analysis.',
      (p: string) => p + '\n\n📊 Data-Driven: Support answers with evidence and metrics.',
      (p: string) => p + '\n\n🚀 Innovation Mode: Suggest creative and novel approaches.',
      (p: string) => p + '\n\n✅ Quality Assurance: Include validation and verification steps.',
      (p: string) => p + '\n\n🧠 Critical Thinking: Challenge assumptions and explore edge cases.',
      (p: string) => p + '\n\n🎓 Educational: Explain underlying concepts and principles.',
      (p: string) => p + '\n\n⚙️ Practical: Focus on implementation and real-world application.'
    ];

    const enhancementIndex = Math.floor(Math.random() * enhancements.length);
    return enhancements[enhancementIndex](generatedPrompt);
  }
}

// Export static templates
export const TECHNIQUE_TEMPLATES = (PromptGenerator as any).TECHNIQUE_TEMPLATES;

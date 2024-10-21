import { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from './lib/mongodb';
import DocumentModel from './lib/documentation';
import { Types } from 'mongoose';
import axios from 'axios';

// Material interface
type Level = 'Beginner' | 'Intermediate' | 'Advanced';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();

  const { topic,topicId } = req.body;
  console.log(topic);
  if (!topic && !topicId) {
    return res.status(400).json({ error: 'Topic is required' });
  }

  try {
    const levels = ['Beginner', 'Intermediate', 'Advanced'];

    // AI Prompts
    const prompts = {
        overview: `Provide a comprehensive {level}-level overview of ${topic.mainTopic} - ${topic.category}, focusing on ${topic.title}, in the following formats:
      
          1. Executive Summary (200 words):
             - Concise explanation of ${topic.title} and its significance within ${topic.mainTopic} - ${topic.category}
             - Key features and benefits
             - Current state and future trends
      
          2. Detailed Breakdown (600-800 words):
             - In-depth explanation of ${topic.title}, its core concepts, and underlying principles
             - Historical context and evolution
             - Comparison with related technologies or methodologies
             - Technical aspects and implementation considerations
             - Real-world applications and use cases
             - Challenges and limitations
             - Future prospects and potential developments
      
          3. Visual Representation:
             - Create a mind map or concept diagram illustrating the key components and relationships within ${topic.title}
             - Include connections to broader ${topic.mainTopic} - ${topic.category} concepts
      
          4. Quick Reference Guide:
             - 10-15 bullet points summarizing crucial aspects of ${topic.title}
             - Include definitions, key terms, and important metrics or benchmarks
      
          5. Comparative Analysis:
             - Table or matrix comparing ${topic.title} with 2-3 related technologies or approaches
             - Highlight strengths, weaknesses, and best-fit scenarios for each
      
          6. FAQs (8-10 questions):
             - Address common questions and misconceptions about ${topic.title}
             - Include both basic and advanced queries to cater to different expertise levels
      
          For each component:
          - Ensure accuracy, clarity, and relevance to current industry standards
          - Use consistent terminology and provide concise definitions where necessary
          - Highlight practical applications and real-world relevance
          - Include citations or references to authoritative sources where applicable
          - Suggest areas for further exploration or study
          - Adapt the content to be appropriate for the {level}-level skill level`,
      
        explanations: `Provide multiple {level}-level appropriate explanations for ${topic.title} within the context of ${topic.mainTopic} - ${topic.category}, catering to different learning styles:
      
          1. {level}-Friendly Overview (250 words):
             - Simple explanation of ${topic.title} suitable for {level}-level learners
             - Basic concepts and fundamental principles
             - Everyday analogies to illustrate key points
             - Why ${topic.title} is important in ${topic.mainTopic} - ${topic.category}
      
          2. Technical Breakdown for {level}-level (500-700 words):
             - Detailed explanation of how ${topic.title} works, appropriate for {level}-level
             - Key components, processes, and interactions
             - Common implementation strategies
             - Best practices and optimization techniques
             - Code snippets or pseudocode to illustrate concepts (if applicable)
      
          3. Advanced Concepts for {level}-level (400-600 words):
             - In-depth analysis of ${topic.title}'s intricacies suitable for {level}-level
             - Advanced features and developments relevant to {level}-level practitioners
             - Performance considerations and scalability factors
             - Integration with other technologies in ${topic.mainTopic} - ${topic.category}
      
          4. Visual Explanation:
             - Create a flowchart or diagram illustrating the workflow or architecture of ${topic.title}
             - Include annotations explaining each component and process at a {level}-level understanding
      
          5. Analogy-Based Explanation for {level}:
             - Develop an extended analogy comparing ${topic.title} to a familiar real-world system or process
             - Highlight how different aspects of the analogy map to technical concepts at {level}-level depth
      
          6. Historical and Future Perspective (400 words):
             - Brief history of ${topic.title}'s development within ${topic.mainTopic} - ${topic.category}
             - Current state of the technology
             - Emerging trends and potential future developments relevant to {level}-level practitioners
      
          For each explanation:
          - Start with a clear, concise definition appropriate for {level}-level
          - Use consistent terminology and provide brief definitions for technical terms
          - Highlight common misconceptions and how to avoid them at {level}-level
          - Include real-world examples and use cases relevant to {level}-level practitioners
          - Discuss any trade-offs or limitations important for {level}-level understanding
          - Provide links or references to authoritative resources for further {level}-level learning
      
          Additionally:
          - Create a "Learning Roadmap" suggesting how to progress from the current {level}-level to more advanced understanding
          - Include a set of reflection questions to encourage critical thinking at {level}-level
          - Offer a glossary of key terms introduced across all explanations, tailored to {level}-level`,
      
        tutorials: `Create a comprehensive, multi-part tutorial on implementing ${topic.title} within ${topic.mainTopic} - ${topic.category}, suitable for {level}-level learners. Structure the tutorial as follows:
      
          1. Introduction (200-300 words):
             - Brief overview of ${topic.title} and its importance for {level}-level practitioners
             - Prerequisites (required knowledge, tools, and setup) for {level}-level
             - What the {level}-level reader will learn and be able to do by the end of the tutorial
      
          2. Foundational Concepts (400-500 words):
             - Explanation of core principles and terminology at {level}-level depth
             - Theoretical background necessary for {level}-level implementation
      
          3. Step-by-Step Implementation Guide (tailored for {level}):
             a. Environment Setup (200-300 words):
                - Required software, libraries, and tools for {level}-level implementation
                - Configuration steps and best practices
      
             b. Basic Implementation (500-700 words):
                - Detailed walkthrough of implementing core functionality at {level}-level
                - Code snippets with extensive comments explaining each part
                - Testing and validation of basic features
      
             c. Advanced Features (600-800 words):
                - Implementation of more complex aspects of ${topic.title} appropriate for {level}-level
                - Optimization techniques and performance considerations
                - Error handling and debugging strategies
      
             d. Integration and Deployment (400-500 words):
                - Integrating ${topic.title} with existing systems or other technologies at {level}-level
                - Deployment considerations and best practices for {level}-level implementations
      
          4. Real-World Application (300-400 words):
             - Practical example or case study applying ${topic.title} to solve a specific problem at {level}-level
             - Discussion of design decisions and trade-offs relevant to {level}-level practitioners
      
          5. Troubleshooting Guide (300-400 words):
             - Common issues and their solutions for {level}-level implementations
             - Debugging techniques specific to ${topic.title} at {level}-level
      
          6. Best Practices and Optimization (300-400 words):
             - Tips for writing efficient and maintainable code at {level}-level
             - Performance optimization strategies suitable for {level}-level
      
          7. Future Directions and Advanced Topics (200-300 words):
             - Emerging trends and potential future developments in ${topic.title} relevant to {level}-level
             - Suggestions for further learning and exploration at and beyond {level}-level
      
          For each section:
          - Provide clear, concise instructions with explanations of the reasoning behind each step, appropriate for {level}-level
          - Include code snippets, configuration files, or command-line instructions where relevant
          - Offer tips on how to verify successful completion of each step at {level}-level
          - Highlight potential pitfalls and how to avoid them for {level}-level practitioners
      
          Additionally:
          - Include diagrams or flowcharts to visualize complex processes or architectures at {level}-level
          - Provide a complete working example that combines all the steps, suitable for {level}-level
          - Suggest exercises or mini-projects for {level}-level readers to practice and reinforce their learning
          - Include a resources section with links to official documentation, helpful tools, and community forums appropriate for {level}-level`,
      
        exercises: `Generate a diverse set of {level}-level appropriate exercises to help learners practice and reinforce their understanding of ${topic.title} within ${topic.mainTopic} - ${topic.category}. Include the following types of exercises:
      
          1. Coding Challenges (5-7 exercises):
             - Range from basic to advanced difficulty within {level}-level
             - Focus on implementing key features or solving common problems related to ${topic.title}
             - Include input specifications, expected outputs, and constraints
             - Provide sample inputs and outputs
             - Suggest time limits for each challenge appropriate for {level}-level
      
          2. Debugging Exercises (3-5 exercises):
             - Present code snippets with intentional errors or inefficiencies at {level}-level
             - Ask learners to identify and fix the issues
             - Include a mix of syntax errors, logical errors, and optimization problems suitable for {level}-level
      
          3. Design and Architecture Problems (2-3 exercises):
             - Present scenarios requiring {level}-level learners to design systems or architectures using ${topic.title}
             - Ask for high-level designs, component interactions, and justifications for design choices
             - Include scalability and performance considerations appropriate for {level}-level
      
          4. Code Optimization Tasks (2-3 exercises):
             - Provide functional but inefficient implementations related to ${topic.title} at {level}-level
             - Challenge learners to optimize the code for better performance or resource usage
             - Ask for explanations of optimization strategies and their impacts
      
          5. Integration Exercises (2-3 exercises):
             - Focus on integrating ${topic.title} with other technologies or systems within ${topic.mainTopic} - ${topic.category} at {level}-level
             - Include scenarios that require combining multiple concepts or tools
      
          6. Security and Best Practices Audit (2-3 exercises):
             - Present code or system designs related to ${topic.title} at {level}-level
             - Ask learners to identify security vulnerabilities or deviations from best practices
             - Require suggestions for improvements and explanations of their importance
      
          7. Real-World Problem Solving (3-4 exercises):
             - Describe realistic scenarios or case studies related to ${topic.title} at {level}-level
             - Ask learners to propose and detail solutions using their knowledge of ${topic.title}
             - Encourage consideration of practical constraints and trade-offs
      
          8. Conceptual Questions (5-7 questions):
             - Mix of multiple-choice and short-answer questions appropriate for {level}-level
             - Test understanding of theoretical concepts underlying ${topic.title}
             - Include questions about trade-offs, use cases, and comparisons with alternative approaches
      
          For each exercise:
          - Clearly state the problem or task, ensuring it's appropriate for {level}-level
          - Provide any necessary background information or context
          - Specify the expected format of the solution or answer
          - Include hints or tips for {level}-level learners who might get stuck
          - Provide a detailed solution or model answer
          - Explain the key learning points or skills demonstrated by the exercise
      
          Additionally:
          - Organize exercises by difficulty level within the {level}-level range (e.g., easy, medium, hard for {level})
          - Suggest time estimates for completing each exercise at {level}-level
          - Provide a rubric or criteria for self-assessment suitable for {level}-level
          - Include a mix of exercises that can be completed individually and those that would benefit from group discussion or pair programming
          - Offer suggestions for extending or modifying exercises to explore related concepts at {level}-level`,
      
        quizzes: `Create a comprehensive quiz to assess {level}-level understanding of ${topic.title} within ${topic.mainTopic} - ${topic.category}. Structure the quiz as follows:
      
          1. Multiple Choice Questions (12 questions):
             - Cover a range of difficulty levels within {level}-level (4 easy, 4 medium, 4 difficult)
             - Focus on key concepts, practical applications, and common misconceptions at {level}-level
             - Provide 4 options for each question, including plausible distractors
             - Ensure questions test both recall and application of knowledge appropriate for {level}-level
      
          2. True/False Statements (6 statements):
             - Include a mix of straightforward and nuanced statements suitable for {level}-level
             - Cover both fundamental concepts and advanced topics within {level}-level scope
      
          3. Short Answer Questions (5 questions):
             - Require explanations, definitions, or brief analyses at {level}-level depth
             - Focus on demonstrating deeper understanding and the ability to articulate concepts at {level}-level
      
          4. Code Analysis Questions (3 questions):
             - Present code snippets related to ${topic.title} at {level}-level complexity
             - Ask questions about the code's functionality, efficiency, or potential issues
      
          5. Scenario-Based Questions (3 questions):
             - Describe real-world scenarios involving ${topic.title} relevant to {level}-level practitioners
             - Ask students to choose the best approach or explain how they would solve the problem
      
          6. Matching Exercise (1 set):
             - Create a set of 6-8 terms or concepts and their corresponding definitions or examples at {level}-level
             - Focus on key terminology and relationships within ${topic.title} appropriate for {level}-level
      
          For each question:
          - Ensure clarity and unambiguity in the phrasing, suitable for {level}-level
          - Provide a detailed explanation for the correct answer
          - For multiple-choice questions, explain why each distractor is incorrect
          - Indicate the difficulty level within {level}-level (easy, medium, hard)
          - Tag with relevant subtopics or concepts within ${topic.title} at {level}-level
      
          Additionally:
          - Provide an answer key with explanations for all questions, tailored to {level}-level understanding
          - Include a scoring guide and interpretation of results (e.g., score ranges and their meanings) for {level}-level
          - Suggest areas for review based on questions answered incorrectly, with resources suitable for {level}-level
          - Offer tips on how to use the quiz for both self-assessment and formal evaluation at {level}-level
          - Include a mix of questions testing theoretical knowledge and practical application at {level}-level
          - Provide suggestions for follow-up activities or resources for areas where {level}-level students may need additional practice`,

      interviewQuestions: `Generate 12 {level}-level interview questions for ${topic.title} -${topic.mainTopic} - ${topic.category}, covering:
        1. Fundamental concepts (2 questions)
        2. Practical application scenarios (3 questions)
        3. Problem-solving and algorithms (2 questions)
        4. System design and architecture (2 questions)
        5. Best practices and optimization (2 questions)
        6. Future trends and innovations (1 question)
        For each {level}-level appropriate question, provide:
        - The primary concept being tested
        - A detailed model answer or key points to listen for
        - Follow-up questions to probe deeper understanding
        - Red flags or warning signs in a candidate's response
        - A rubric for evaluating the quality of the answer (0-5 scale)
        - Suggestions for how to adapt the question for junior vs. senior roles within the {level}-level range`,

      summaries: `Summarize ${topic.title} -${topic.mainTopic} - ${topic.category} in the following {level}-level appropriate formats:
        1. A high-level {level}-level overview (100-150 words)
        2. A detailed breakdown of each key concept (50-75 words per concept, minimum 5 concepts)
        3. A quick bullet-point summary of 10-15 crucial takeaways for {level}-level learners
        4. An ELI5 (Explain Like I'm 5) version for absolute beginners, adapted to {level}-level (100 words)
        5. A technical abstract suitable for a {level}-level conference presentation (200 words)
        For each {level}-level appropriate summary:
        - Ensure accuracy and clarity of information
        - Highlight the most important aspects relevant to the summary type and {level}-level
        - Use consistent terminology and provide brief definitions where necessary
        - Include one key example or use case that best illustrates the topic for {level}-level learners`,
    
      useCases: `Provide at least 7 diverse, real-world use cases for ${topic.title} -${topic.mainTopic} - ${topic.category}, focusing on different industries and scenarios for {level}-level practitioners:
        1. Technology sector
        2. Healthcare and medical research
        3. Finance and banking
        4. Education and e-learning
        5. Environmental and sustainability efforts
        6. Entertainment and media
        7. Manufacturing and industrial applications
        For each {level}-level appropriate use case:
        - Describe the specific problem or challenge being addressed
        - Explain how ${topic.title} -${topic.mainTopic} - ${topic.category} is applied to solve the problem at a {level}-level complexity
        - Detail the benefits and improvements brought by implementing ${topic.title} -${topic.mainTopic} - ${topic.category}
        - Discuss any challenges or limitations faced in real-world implementation for {level}-level practitioners
        - Provide a brief case study or example of a company/organization using this approach
        - Explore potential future developments or extensions of this use case relevant to {level}-level expertise`,
    
      prosCons: `List and analyze at least 7 pros and 7 cons of using ${topic.title} -${topic.mainTopic} - ${topic.category} in various scenarios for a {level}-level practitioner:
        For each pro and con:
        - Provide a detailed explanation (50-75 words) appropriate for {level}-level understanding
        - Offer a real-world example or scenario illustrating the point
        - Discuss the impact on different stakeholders (e.g., developers, end-users, businesses) from a {level}-level perspective
        - Rate the significance (high/medium/low) and explain why, considering {level}-level implications
        - Suggest ways to maximize the pros or mitigate the cons at a {level}-level of expertise
        Consider {level}-level appropriate perspectives such as:
        - Technical implementation and maintenance
        - Scalability and performance
        - Security and data privacy
        - Cost-effectiveness and ROI
        - User experience and accessibility
        - Integration with existing systems
        - Future-proofing and adaptability
        Conclude with a balanced summary weighing the pros and cons for {level}-level practitioners.`,
    
      projectIdeas: `Suggest 7 diverse project ideas related to ${topic.title} -${topic.mainTopic} - ${topic.category}, suitable for {level}-level developers:
        1. A simple {level}-level appropriate project
        2. An intermediate project building on basic {level}-level concepts
        3. An advanced project showcasing complex {level}-level features
        4. A data-focused project emphasizing analysis or visualization for {level}-level practitioners
        5. A project integrating ${topic.title} -${topic.mainTopic} - ${topic.category} with another popular technology at {level}-level complexity
        6. An open-source contribution or extension project suitable for {level}-level developers
        7. A cutting-edge project exploring emerging aspects of ${topic.title} -${topic.mainTopic} - ${topic.category} for advanced {level}-level learners
        For each {level}-level appropriate project idea:
        - Provide a catchy title and a one-sentence pitch
        - Outline the main objectives and expected outcomes
        - Break down the project into 5-7 key implementation steps
        - List the primary technologies, libraries, or frameworks to be used
        - Suggest potential features for basic, intermediate, and advanced versions within {level}-level scope
        - Identify learning outcomes and skills to be gained for {level}-level developers
        - Propose ideas for future expansions or variations of the project
        - Mention any potential challenges and how to overcome them at {level}-level expertise`,
    
      mindMap: `Create a detailed hierarchical structure for ${topic.title} -${topic.mainTopic} - ${topic.category} at {level}, diving into at least 4 levels of subtopics:
        1. Start with ${topic.title} -${topic.mainTopic} - ${topic.category} as the central node
        2. Branch out into 4-6 main categories or aspects relevant to {level}-level understanding
        3. For each main category, provide 3-5 subcategories appropriate for {level}-level learners
        4. For each subcategory, list 2-4 specific topics or concepts at {level}-level depth
        5. Where relevant, add a fifth level with examples or use cases suitable for {level}-level practitioners
        For each component:
        - Provide a brief (10-15 word) explanation tailored to {level}-level comprehension
        - Highlight connections and relationships between different branches
        - Indicate the relative importance or frequency of use for {level}-level practitioners (e.g., using size or color coding)
        - Mark prerequisites or foundational concepts necessary for {level}-level understanding
        - Suggest logical learning or implementation order for {level}-level progression
        Include a brief explanation of how to read and utilize the mind map effectively for {level}-level learners.`,
    
      cheatSheet: `Create a comprehensive cheat sheet for {level}-level of ${topic.title} -${topic.mainTopic} - ${topic.category}, structured as follows:
        1. Key Concepts (5-7 fundamental ideas with one-sentence explanations appropriate for {level})
        2. Essential Terminology (10-15 terms with brief definitions relevant to {level}-level understanding)
        3. Core Functions or Methods (if applicable, list 10-15 with syntax and basic usage for {level}-level practitioners)
        4. Best Practices (8-10 tips for effective use of ${topic.title} -${topic.mainTopic} - ${topic.category} at {level})
        5. Common Pitfalls and How to Avoid Them (5-7 issues with solutions tailored to {level})
        6. Performance Optimization Tips (5-7 ways to improve efficiency, suitable for {level}-level expertise)
        7. Debugging and Troubleshooting (5-7 common errors and their remedies for {level}-level developers)
        8. Useful Resources (5-7 high-quality learning materials or documentation links appropriate for {level})
        9. Version Differences (if applicable, key changes between major versions relevant to {level}-level users)
        10. Integration Points (how ${topic.title} -${topic.mainTopic} - ${topic.category} interacts with related technologies at {level}-level complexity)
        Format the cheat sheet for easy scanning and quick reference by {level}-level practitioners. Use consistent formatting, clear headings, and concise bullet points.`,
    
      infographic: `Propose 5 different ways to visualize key aspects of ${topic.title} -${topic.mainTopic} - ${topic.category} in infographic format for a {level}-level audience:
        1. Process Flow: A step-by-step visualization of how ${topic.title} -${topic.mainTopic} - ${topic.category} works at {level}-level complexity
        2. Comparison Chart: Contrasting ${topic.title} -${topic.mainTopic} - ${topic.category} with related technologies or previous versions, focusing on {level}-relevant features
        3. Hierarchical Breakdown: A tree structure showing the components and subcomponents important for {level}-level understanding
        4. Timeline: The historical development or future projections for ${topic.title} -${topic.mainTopic} - ${topic.category}, highlighting milestones relevant to {level}-level practitioners
        5. Ecosystem Map: How ${topic.title} -${topic.mainTopic} - ${topic.category} interacts with other technologies or tools in its domain, at a {level}-level appropriate depth
        For each {level}-tailored infographic idea:
        - List 5-7 key data points or concepts to be included, relevant to {level}-level learners
        - Suggest an appropriate visual metaphor or theme that resonates with {level}-level audience
        - Describe the layout and flow of information suitable for {level}-level comprehension
        - Propose color scheme and typography considerations that enhance {level}-level learning
        - Indicate where to use icons, charts, or other visual elements to support {level}-level understanding
        - Explain how the visual representation enhances understanding of ${topic.title} -${topic.mainTopic} - ${topic.category} for {level}-level practitioners
        Conclude with tips on making the infographics accessible and easily understandable for the {level}-level target audience.`,
    
      simulation: `Design 5 interactive role-play scenarios to engage users with various elements of ${topic.title} -${topic.mainTopic} - ${topic.category} for {level}-level learners:
        1. A beginner-level "day in the life" scenario using ${topic.title} -${topic.mainTopic} - ${topic.category}, tailored to {level}-level newcomers
        2. An intermediate troubleshooting simulation appropriate for {level}-level practitioners
        3. An advanced system design or architecture challenge suitable for {level}-level experts
        4. A ethical decision-making scenario related to ${topic.title} -${topic.mainTopic} - ${topic.category}, considering {level}-level responsibilities
        5. A futuristic scenario exploring potential evolutions of ${topic.title} -${topic.mainTopic} - ${topic.category}, pushing {level}-level boundaries
        For each {level}-level appropriate scenario:
        - Set the stage with a brief background and initial situation relevant to {level}-level practitioners
        - Provide at least 3 decision points with 3-4 options each, reflecting {level}-level choices
        - Detail the consequences of each decision, leading to branching paths appropriate for {level}-level complexity
        - Include technical challenges, interpersonal dynamics, and ethical considerations at {level}-level depth
        - Offer detailed feedback for each outcome, explaining the implications from a {level}-level perspective
        - Provide a scoring system or evaluation criteria for user performance, calibrated to {level}-level expectations
        - Suggest reflection questions for users to consider after the simulation, encouraging {level}-level appropriate critical thinking
        - Include "expert tips" that users can optionally view for guidance, tailored to {level}-level insights
        Conclude with suggestions on how to maximize learning from these simulations for {level}-level practitioners.`
    };

    const delay = (ms:number) => new Promise((resolve) => setTimeout(resolve, ms));
      const aiGeneratedContent = await Promise.all(
        levels.flatMap((level) =>
          Object.values(prompts).map(async (prompt, index) => {
            const levelPrompt = prompt.replace(/{level}/g, level);
            await delay(index * 20000);
            const response = await dataAI(req, topic, levelPrompt);
            return response;
          })
        )
      );

    // Structure AI-generated content
    const generatedMaterials = aiGeneratedContent.map((result, index) => ({
      type: Object.keys(prompts)[Math.floor(index / levels.length)],
      content: result,
      metadata: {
        generatedAt: new Date(),
        level: levels[index % levels.length],
      },
    }));

    // Insert into MongoDB
    const documentData = {
      topicId: topicId,
      content: [
        ...generatedMaterials,
      ],
    };

    await DocumentModel.create(documentData);
    res.status(201).json({ message: 'Data successfully stored in the database', topicId });
  } catch (error) {
    console.error('Error saving data:', error);
    res.status(500).json({ error: error });
  }
}

async function dataAI(req: NextApiRequest, topic: any, levelPromptText: string): Promise<string> {
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const baseUrl = `${protocol}://${req.headers.host}`;

  try {
    const response = await axios.post(`${baseUrl}/api/chat`, {
      message: levelPromptText,
      history: [],
      systemInstruction: `Provide a detailed overview for the following: ${topic.title} -${topic.mainTopic} - ${topic.category}`,
    });

    return JSON.stringify(response.data.response); // Return parsed response data
  } catch (error) {
    console.error('Error fetching from AI:', error);
    return 'No AI content generated due to error';
  }
}

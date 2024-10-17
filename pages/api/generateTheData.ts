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
  console.log(topicId);
  if (!topic && !topicId) {
    return res.status(400).json({ error: 'Topic is required' });
  }

  try {
    const levels = ['Beginner', 'Intermediate', 'Advanced'];

    // AI Prompts
    const prompts = {
      exercises: `Generate a comprehensive list of at least 8 diverse {level}-level exercises for ${topic}. Include:
        1. Coding challenges with increasing complexity
        2. Real-world problem-solving scenarios
        3. Theoretical questions to test conceptual understanding
        4. Debugging exercises with intentional errors
        5. System design or architecture problems (if applicable)
        For each {level}-level exercise, provide:
        - A clear, concise problem statement
        - Detailed input specifications and constraints
        - Expected outputs or success criteria
        - A step-by-step solution or approach
        - At least one test case with sample input and output
        - Hints or tips for {level} learners who might get stuck
        - Potential follow-up questions or extensions to deepen understanding`,
    
      quizzes: `Create a well-rounded set of 15 {level}-level quiz questions for ${topic}. Include:
        - 7 multiple-choice questions (with 4 options each)
        - 5 short-answer questions
        - 3 true/false statements
        For each {level}-appropriate question, provide:
        - A clear, unambiguous question stem
        - For multiple-choice: logical distractors that test common misconceptions
        - Detailed explanations for both correct and incorrect answers
        - The reasoning behind why each distractor might be tempting
        - A difficulty rating (easy, medium, hard) within the {level} range
        - Tags or categories to group related questions
        - At least one follow-up question to encourage deeper thinking`,
    
      interviewQuestions: `Generate 12 {level}-level interview questions for ${topic}, covering:
        1. Fundamental concepts (2 questions)
        2. Practical application scenarios (3 questions)
        3. Problem-solving and algorithms (2 questions)
        4. System design and architecture (2 questions)
        5. Best practices and optimization (2 questions)
        6. Future trends and innovations (1 question)
        For each {level}-appropriate question, provide:
        - The primary concept being tested
        - A detailed model answer or key points to listen for
        - Follow-up questions to probe deeper understanding
        - Red flags or warning signs in a candidate's response
        - A rubric for evaluating the quality of the answer (0-5 scale)
        - Suggestions for how to adapt the question for junior vs. senior roles within the {level} range`,
    
      explanations: `Provide multiple {level}-level explanations for ${topic}, including:
        1. A high-level overview suitable for {level} beginners (max 150 words)
        2. A detailed technical breakdown for intermediate {level} learners (300-500 words)
        3. An advanced deep-dive exploring nuances and edge cases for advanced {level} learners (500+ words)
        For each {level}-appropriate explanation:
        - Start with a clear, concise definition
        - Use analogies and real-world examples to illustrate concepts
        - Compare and contrast with related technologies or approaches
        - Include code snippets or pseudocode where applicable
        - Highlight common misconceptions and how to avoid them
        - Provide a step-by-step walkthrough of how it works in practice
        - Discuss performance implications and scalability considerations
        - End with a summary of key takeaways and further learning resources`,
    
      summaries: `Summarize ${topic} in the following {level}-appropriate formats:
        1. A high-level {level} overview (100-150 words)
        2. A detailed breakdown of each key concept (50-75 words per concept, minimum 5 concepts)
        3. A quick bullet-point summary of 10-15 crucial takeaways for {level} learners
        4. An ELI5 (Explain Like I'm 5) version for absolute beginners, adapted to {level} (100 words)
        5. A technical abstract suitable for a {level} conference presentation (200 words)
        For each {level}-appropriate summary:
        - Ensure accuracy and clarity of information
        - Highlight the most important aspects relevant to the summary type and {level}
        - Use consistent terminology and provide brief definitions where necessary
        - Include one key example or use case that best illustrates the topic for {level} learners`,
    
      tutorials: `Write a comprehensive, {level}-level tutorial on implementing ${topic}. Include:
        1. Introduction and prerequisites (tools, knowledge, setup) for {level} learners
        2. At least 12 detailed steps, each covering a crucial aspect of implementation
        3. Code snippets for each step (if applicable), with comments explaining key parts
        4. Clear instructions on how to test or verify each step's success
        5. Explanations of why each step is important and how it fits into the bigger picture
        6. Common pitfalls, edge cases, or gotchas for each step, and how to avoid them
        7. Best practices and optimization tips throughout the tutorial, appropriate for {level}
        8. A troubleshooting section addressing at least 5 common issues for {level} implementers
        9. A final section on next steps, advanced topics, and further resources for {level} learners
        10. A complete working example that combines all the steps
        Ensure the tutorial is hands-on, engaging, and encourages active learning for {level} students.`,
    
      useCases: `Provide at least 7 diverse, real-world use cases for ${topic}, focusing on different industries and scenarios for {level} practitioners:
        1. Technology sector
        2. Healthcare and medical research
        3. Finance and banking
        4. Education and e-learning
        5. Environmental and sustainability efforts
        6. Entertainment and media
        7. Manufacturing and industrial applications
        For each {level}-appropriate use case:
        - Describe the specific problem or challenge being addressed
        - Explain how ${topic} is applied to solve the problem at a {level} complexity
        - Detail the benefits and improvements brought by implementing ${topic}
        - Discuss any challenges or limitations faced in real-world implementation for {level} practitioners
        - Provide a brief case study or example of a company/organization using this approach
        - Explore potential future developments or extensions of this use case relevant to {level} expertise`,
    
      prosCons: `List and analyze at least 7 pros and 7 cons of using ${topic} in various scenarios for a {level} practitioner:
        For each pro and con:
        - Provide a detailed explanation (50-75 words) appropriate for {level} understanding
        - Offer a real-world example or scenario illustrating the point
        - Discuss the impact on different stakeholders (e.g., developers, end-users, businesses) from a {level} perspective
        - Rate the significance (high/medium/low) and explain why, considering {level} implications
        - Suggest ways to maximize the pros or mitigate the cons at a {level} of expertise
        Consider {level}-appropriate perspectives such as:
        - Technical implementation and maintenance
        - Scalability and performance
        - Security and data privacy
        - Cost-effectiveness and ROI
        - User experience and accessibility
        - Integration with existing systems
        - Future-proofing and adaptability
        Conclude with a balanced summary weighing the pros and cons for {level} practitioners.`,
    
      projectIdeas: `Suggest 7 diverse project ideas related to ${topic}, suitable for {level} developers:
        1. A simple {level}-appropriate project
        2. An intermediate project building on basic {level} concepts
        3. An advanced project showcasing complex {level} features
        4. A data-focused project emphasizing analysis or visualization for {level} practitioners
        5. A project integrating ${topic} with another popular technology at {level} complexity
        6. An open-source contribution or extension project suitable for {level} developers
        7. A cutting-edge project exploring emerging aspects of ${topic} for advanced {level} learners
        For each {level}-appropriate project idea:
        - Provide a catchy title and a one-sentence pitch
        - Outline the main objectives and expected outcomes
        - Break down the project into 5-7 key implementation steps
        - List the primary technologies, libraries, or frameworks to be used
        - Suggest potential features for basic, intermediate, and advanced versions within {level} scope
        - Identify learning outcomes and skills to be gained for {level} developers
        - Propose ideas for future expansions or variations of the project
        - Mention any potential challenges and how to overcome them at {level} expertise`,
    
      mindMap: `Create a detailed hierarchical structure for ${topic} at {level}, diving into at least 4 levels of subtopics:
        1. Start with ${topic} as the central node
        2. Branch out into 4-6 main categories or aspects relevant to {level} understanding
        3. For each main category, provide 3-5 subcategories appropriate for {level} learners
        4. For each subcategory, list 2-4 specific topics or concepts at {level} depth
        5. Where relevant, add a fifth level with examples or use cases suitable for {level} practitioners
        For each component:
        - Provide a brief (10-15 word) explanation tailored to {level} comprehension
        - Highlight connections and relationships between different branches
        - Indicate the relative importance or frequency of use for {level} practitioners (e.g., using size or color coding)
        - Mark prerequisites or foundational concepts necessary for {level} understanding
        - Suggest logical learning or implementation order for {level} progression
        Include a brief explanation of how to read and utilize the mind map effectively for {level} learners.`,
    
      cheatSheet: `Create a comprehensive cheat sheet for {level} of ${topic}, structured as follows:
        1. Key Concepts (5-7 fundamental ideas with one-sentence explanations appropriate for {level})
        2. Essential Terminology (10-15 terms with brief definitions relevant to {level} understanding)
        3. Core Functions or Methods (if applicable, list 10-15 with syntax and basic usage for {level} practitioners)
        4. Best Practices (8-10 tips for effective use of ${topic} at {level})
        5. Common Pitfalls and How to Avoid Them (5-7 issues with solutions tailored to {level})
        6. Performance Optimization Tips (5-7 ways to improve efficiency, suitable for {level} expertise)
        7. Debugging and Troubleshooting (5-7 common errors and their remedies for {level} developers)
        8. Useful Resources (5-7 high-quality learning materials or documentation links appropriate for {level})
        9. Version Differences (if applicable, key changes between major versions relevant to {level} users)
        10. Integration Points (how ${topic} interacts with related technologies at {level} complexity)
        Format the cheat sheet for easy scanning and quick reference by {level} practitioners. Use consistent formatting, clear headings, and concise bullet points.`,
    
      infographic: `Propose 5 different ways to visualize key aspects of ${topic} in infographic format for a {level} audience:
        1. Process Flow: A step-by-step visualization of how ${topic} works at {level} complexity
        2. Comparison Chart: Contrasting ${topic} with related technologies or previous versions, focusing on {level}-relevant features
        3. Hierarchical Breakdown: A tree structure showing the components and subcomponents important for {level} understanding
        4. Timeline: The historical development or future projections for ${topic}, highlighting milestones relevant to {level} practitioners
        5. Ecosystem Map: How ${topic} interacts with other technologies or tools in its domain, at a {level}-appropriate depth
        For each {level}-tailored infographic idea:
        - List 5-7 key data points or concepts to be included, relevant to {level} learners
        - Suggest an appropriate visual metaphor or theme that resonates with {level} audience
        - Describe the layout and flow of information suitable for {level} comprehension
        - Propose color scheme and typography considerations that enhance {level} learning
        - Indicate where to use icons, charts, or other visual elements to support {level} understanding
        - Explain how the visual representation enhances understanding of ${topic} for {level} practitioners
        Conclude with tips on making the infographics accessible and easily understandable for the {level} target audience.`,
    
      simulation: `Design 5 interactive role-play scenarios to engage users with various elements of ${topic} for {level} learners:
        1. A beginner-level "day in the life" scenario using ${topic}, tailored to {level} newcomers
        2. An intermediate troubleshooting simulation appropriate for {level} practitioners
        3. An advanced system design or architecture challenge suitable for {level} experts
        4. A ethical decision-making scenario related to ${topic}, considering {level} responsibilities
        5. A futuristic scenario exploring potential evolutions of ${topic}, pushing {level} boundaries
        For each {level}-appropriate scenario:
        - Set the stage with a brief background and initial situation relevant to {level} practitioners
        - Provide at least 3 decision points with 3-4 options each, reflecting {level} choices
        - Detail the consequences of each decision, leading to branching paths appropriate for {level} complexity
        - Include technical challenges, interpersonal dynamics, and ethical considerations at {level} depth
        - Offer detailed feedback for each outcome, explaining the implications from a {level} perspective
        - Provide a scoring system or evaluation criteria for user performance, calibrated to {level} expectations
        - Suggest reflection questions for users to consider after the simulation, encouraging {level}-appropriate critical thinking
        - Include "expert tips" that users can optionally view for guidance, tailored to {level} insights
        Conclude with suggestions on how to maximize learning from these simulations for {level} practitioners.`
    };

    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    const aiGeneratedContent = await Promise.all(
      levels.flatMap(level =>
        Object.values(prompts).map(async (prompt, index) => {
          const levelPrompt = prompt.replace('{level}', level);

          // Introduce a delay of 5 seconds between each request
          await delay(index * 10000);

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

async function dataAI(req: NextApiRequest, topic: string, levelPromptText: string): Promise<string> {
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const baseUrl = `${protocol}://${req.headers.host}`;

  try {
    const response = await axios.post(`${baseUrl}/api/chat`, {
      message: levelPromptText,
      history: [],
      systemInstruction: `Provide a detailed overview for the following: ${topic}`,
    });

    return JSON.stringify(response.data.response); // Return parsed response data
  } catch (error) {
    console.error('Error fetching from AI:', error);
    return 'No AI content generated due to error';
  }
}

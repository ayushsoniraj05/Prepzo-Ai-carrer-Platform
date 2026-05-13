import ModuleSeeder from '../models/ModuleSeeder.model.js';
import Question from '../models/Question.model.js';
import * as aiService from './aiService.js';
import mongoose from 'mongoose';

class AutonomousSeeder {
  constructor() {
    this.isActive = false;
    this.cooldownMs = 5000; // 5 seconds between batches
    this.batchSize = 25;    // Generate 25 questions per batch
  }

  /**
   * Start the background seeding process
   */
  async start() {
    if (this.isActive) return;
    this.isActive = true;
    console.log('Autonomous Seeder started.');
    this.run();
  }

  /**
   * Main loop
   */
  async run() {
    while (this.isActive) {
      // Safety check: Never run persistent loops in production serverless environments
      if (process.env.NODE_ENV === 'production') {
        console.warn('⛔ Seeder loop attempted to run in production. Terminating loop for stability.');
        this.isActive = false;
        break;
      }

      try {
        const job = await this.getNextJob();
        if (!job) {
          console.log('No pending seeding jobs. Sleeping for 1 minute...');
          await new Promise(resolve => setTimeout(resolve, 60000));
          continue;
        }

        await this.processJob(job);
        
        // Cooldown between batches to respect Groq rate limits
        await new Promise(resolve => setTimeout(resolve, this.cooldownMs));
      } catch (error) {
        console.error('Seeder Loop Error:', error);
        await new Promise(resolve => setTimeout(resolve, 10000)); // Wait before retry
      }
    }
  }

  /**
   * Find the next module to seed.
   * Prioritizes high priority (student-requested) then pending.
   */
  async getNextJob() {
    return await ModuleSeeder.findOne({
      status: { $in: ['pending', 'active'] },
      questionCount: { $lt: 1000 }
    }).sort({ priority: -1, lastSeededAt: 1 });
  }

  /**
   * Process a single module batch
   */
  async processJob(job) {
    console.log(`Seeding module: ${job.moduleId} (Current: ${job.questionCount}/1000)`);
    
    job.status = 'active';
    await job.save();

    try {
      // 1. Request batch from AI Service
      const studentProfile = {
        id: 'bot_seeder_' + job.moduleId,
        name: 'Seeder Bot',
        stream: job.field,
        targetRole: job.targetRole,
        fieldOfStudy: job.field,
        degree: 'B.Tech', 
        year: '4',
        knownTechnologies: job.topics || [] 
      };

      const testConfig = {
        questionCount: this.batchSize,
        difficultyRange: 'mixed',
        isSeedingTask: true,
        category: job.category || 'foundational'
      };

      const aiResponse = await aiService.generateAITest(studentProfile, testConfig);

      if (!aiResponse || !aiResponse.questions || !aiResponse.questions.length) {
        throw new Error('AI returned no questions');
      }

      // 2. Format and Insert
      const questionsToInsert = aiResponse.questions.map(q => ({
        moduleId: job.moduleId,
        field: job.field,
        targetRole: job.targetRole,
        type: q.type || 'mcq',
        questionText: q.questionText || q.question,
        options: q.options || [],
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        difficulty: q.difficulty || 'medium',
        topics: q.topics || job.topics || [],
        category: job.category || 'foundational',
        metadata: {
          generatedBy: 'groq',
          modelUsed: 'llama-3.1-70b-versatile',
          seed: new mongoose.Types.ObjectId().toString()
        }
      }));

      const results = await Question.insertMany(questionsToInsert);
      
      // 3. Update Progress
      job.questionCount += results.length;
      job.lastSeededAt = new Date();
      job.status = job.questionCount >= 1000 ? 'completed' : 'pending';
      await job.save();

      console.log(`Successfully seeded ${results.length} questions for ${job.moduleId}. Total: ${job.questionCount}`);
    } catch (error) {
      console.error(`Error processing job ${job.moduleId}:`, error.message);
      job.status = 'pending'; 
      job.errorLog = error.message;
      job.retryCount += 1;
      await job.save();
    }
  }

  /**
   * Trigger an immediate seeding for a specific module
   */
  async boostModule(field, targetRole) {
    const moduleId = `${field.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${targetRole.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    await ModuleSeeder.findOneAndUpdate(
      { moduleId },
      { $set: { priority: 10, status: 'pending', category: 'foundational' }, $setOnInsert: { field, targetRole, questionCount: 0 } },
      { upsert: true }
    );
    console.log(`Boosted module priority: ${moduleId}`);
  }

  /**
   * Trigger an immediate seeding for a specific topic (skill)
   */
  async boostTopic(topic, field, targetRole) {
    const topicId = `topic_${topic.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    const cleanField = (field || 'General').toLowerCase().replace(/[^a-z0-9]/g, '_');
    const moduleId = `${topicId}_in_${cleanField}`;

    await ModuleSeeder.findOneAndUpdate(
      { moduleId },
      { 
        $set: { priority: 15, status: 'pending', category: 'practical' }, 
        $setOnInsert: { 
          field: field || 'General', 
          targetRole: targetRole || 'Software Engineer', 
          questionCount: 0,
          topics: [topic] 
        } 
      },
      { upsert: true }
    );
    console.log(`Boosted topic priority: ${moduleId} (${topic})`);
  }

  stop() {
    this.isActive = false;
  }
}

export const seeder = new AutonomousSeeder();
export default seeder;

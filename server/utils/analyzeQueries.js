// server/utils/analyzeQueries.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user.model');
const Song = require('../models/song.model');
const Session = require('../models/session.model');

mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000
})
.then(() => console.log('MongoDB Connected'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

const analyzeQueries = async () => {
  try {
    console.log('Analyzing User queries...');
    
    // Analyze username lookup (login)
    const usernameExplain = await User.collection.explain('executionStats').findOne({ username: 'admin' });
    console.log('Username lookup execution stats:');
    console.log(`- Execution time: ${usernameExplain.executionStats.executionTimeMillis}ms`);
    console.log(`- Index used: ${usernameExplain.queryPlanner.winningPlan.inputStage.indexName || 'NONE'}`);
    console.log(`- Documents examined: ${usernameExplain.executionStats.totalDocsExamined}`);
    
    console.log('\nAnalyzing Song queries...');
    
    // Analyze text search
    const textSearchExplain = await Song.collection.explain('executionStats').find({ 
      $text: { $search: 'imagine' } 
    }).toArray();
    console.log('Text search execution stats:');
    console.log(`- Execution time: ${textSearchExplain.executionStats.executionTimeMillis}ms`);
    console.log(`- Index used: ${textSearchExplain.queryPlanner.winningPlan.inputStage.indexName || 'NONE'}`);
    console.log(`- Documents examined: ${textSearchExplain.executionStats.totalDocsExamined}`);
    
    // Analyze language filter
    const languageExplain = await Song.collection.explain('executionStats').find({ 
      language: 'English' 
    }).toArray();
    console.log('\nLanguage filter execution stats:');
    console.log(`- Execution time: ${languageExplain.executionStats.executionTimeMillis}ms`);
    console.log(`- Index used: ${languageExplain.queryPlanner.winningPlan.inputStage.indexName || 'NONE'}`);
    console.log(`- Documents examined: ${languageExplain.executionStats.totalDocsExamined}`);
    
    console.log('\nAnalyzing Session queries...');
    
    // Analyze active sessions
    const activeSessionExplain = await Session.collection.explain('executionStats').find({ 
      isActive: true 
    }).sort({ createdAt: -1 }).toArray();
    console.log('Active sessions execution stats:');
    console.log(`- Execution time: ${activeSessionExplain.executionStats.executionTimeMillis}ms`);
    console.log(`- Index used: ${activeSessionExplain.queryPlanner.winningPlan.inputStage.indexName || 'NONE'}`);
    console.log(`- Documents examined: ${activeSessionExplain.executionStats.totalDocsExamined}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error analyzing queries:', error);
    process.exit(1);
  }
};

analyzeQueries();
/**
 * API endpoint for generating wildfire safety quiz questions
 */

import { NextRequest, NextResponse } from 'next/server';

// Wildfire safety knowledge base
const WILDFIRE_KNOWLEDGE_BASE = `
WILDFIRE SAFETY AND PREVENTION GUIDE

Defensible Space:
Defensible space is the buffer you create between a building and the grass, trees, shrubs, or any wildland area that surrounds it. This space is needed to slow or stop the spread of wildfire and it protects your home from catching fire. California law requires 100 feet of defensible space around homes and structures. Zone 0 (0-5 feet) should be ember-resistant with hardscaping. Zone 1 (5-30 feet) should have well-spaced plants with no dead vegetation. Zone 2 (30-100 feet) can have more natural vegetation but must be managed.

Fire-Resistant Materials:
Class A roofing materials are the most fire-resistant, including metal, clay, concrete tiles, and asphalt shingles. Wood shake roofs are extremely vulnerable. Dual-pane windows help prevent radiant heat from breaking glass. Ember-resistant vents with 1/8-inch mesh screens prevent ember intrusion. Non-combustible siding like stucco, fiber cement, or brick provides better protection than vinyl siding.

Red Flag Warnings:
Red Flag Warnings are issued when warm temperatures, very low humidity, and strong winds combine to create critical fire weather conditions. These warnings mean fires can start easily, spread quickly, and are difficult to control. During Red Flag days, avoid outdoor burning, be careful with equipment that can create sparks, and be ready to evacuate.

Air Quality and Smoke:
The Air Quality Index (AQI) measures air pollution. During wildfires, AQI can exceed 300 (hazardous). AQI 0-50 is good. 51-100 is moderate. 101-150 is unhealthy for sensitive groups. 151-200 is unhealthy. 201-300 is very unhealthy. Above 300 is hazardous. N95 or P100 masks filter smoke particles. Stay indoors when AQI exceeds 150.

Fire Behavior:
Fires spread fastest uphill due to preheating of fuel ahead of the fire. A fire can double its speed for every 10-degree increase in slope. Wind carries embers miles ahead of the main fire front. These embers cause most home ignitions during wildfires. Fires are most active during afternoon when temperatures peak and humidity drops. Nighttime often brings calmer conditions.

Evacuation Planning:
Create multiple evacuation routes from your home and neighborhood. Practice with your family. Know your community's evacuation zones. Have a go-bag ready with important documents, medications, water (1 gallon per person per day), N95 masks, battery-powered radio, flashlight, first aid kit, and copies of insurance and ID. Include pet supplies and carriers. Don't wait for evacuation orders to leave if you feel unsafe.

Fire-Resistant Landscaping:
Choose fire-resistant plants like lavender, rockrose, ice plant, and California fuchsia. Avoid highly flammable plants like eucalyptus, bamboo, pine, and juniper. Keep lawns watered and mowed. Remove dead vegetation regularly. Space trees to prevent crown fires. Prune branches to 10 feet from structures. Use hardscaping like gravel, pavers, and stone walls near the home.

Maintenance Schedule:
Clean gutters and roofs monthly during fire season. Remove pine needles and leaves from roof valleys. Trim tree branches 10 feet from chimneys. Check and clear vent screens. Inspect and maintain sprinkler systems. Mow dry grass before it exceeds 4 inches. Create fuel breaks by removing vegetation along driveways. Stack firewood at least 30 feet from structures.

Community Preparedness:
Join or create a Firewise USA community. Participate in community chipping programs. Organize neighborhood cleanup days. Share evacuation plans with neighbors. Create phone trees for emergency communications. Identify vulnerable neighbors who may need assistance. Support local fire departments and volunteer programs. Attend community preparedness meetings.

Insurance and Documentation:
Review your homeowners insurance annually. Understand your wildfire coverage and deductibles. California FAIR Plan provides basic coverage when regular insurance is unavailable. Create a home inventory with photos and videos. Store important documents in fireproof safes or cloud storage. Keep copies of insurance policies, property deeds, birth certificates, and medical records in your go-bag. Document improvements to your defensible space for insurance purposes.
`;

interface WildfireQuizQuestion {
  id: string;
  questionText: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
}

/**
 * Generate quiz questions using AI-like logic based on wildfire knowledge base
 */
function generateWildfireQuestions(count: number = 10): WildfireQuizQuestion[] {
  const questionPool: WildfireQuizQuestion[] = [
    // Defensible Space Questions
    {
      id: 'q1',
      questionText: 'How far should defensible space extend around your home according to California law?',
      options: [
        { id: 'o1a', text: '30 feet' },
        { id: 'o1b', text: '50 feet' },
        { id: 'o1c', text: '100 feet' },
        { id: 'o1d', text: '150 feet' },
      ],
      correctOptionId: 'o1c',
      explanation: 'California law requires 100 feet of defensible space around homes. This buffer helps slow or stop wildfire spread.',
      difficulty: 'easy',
      category: 'Defensible Space'
    },
    {
      id: 'q2',
      questionText: 'What is Zone 0 in defensible space planning?',
      options: [
        { id: 'o2a', text: 'The area 0-5 feet from the home with ember-resistant materials' },
        { id: 'o2b', text: 'The natural vegetation zone' },
        { id: 'o2c', text: 'The evacuation zone' },
        { id: 'o2d', text: 'The firebreak area' },
      ],
      correctOptionId: 'o2a',
      explanation: 'Zone 0 (0-5 feet) should be ember-resistant with hardscaping like gravel, pavers, or concrete to prevent ember ignition.',
      difficulty: 'medium',
      category: 'Defensible Space'
    },
    // Fire-Resistant Materials
    {
      id: 'q3',
      questionText: 'Which roofing material is most fire-resistant?',
      options: [
        { id: 'o3a', text: 'Wood shake shingles' },
        { id: 'o3b', text: 'Class A rated metal or tile' },
        { id: 'o3c', text: 'Composite shingles' },
        { id: 'o3d', text: 'Asphalt shingles' },
      ],
      correctOptionId: 'o3b',
      explanation: 'Class A roofing materials like metal, clay, and concrete tiles are most fire-resistant. Wood shake roofs are extremely vulnerable.',
      difficulty: 'easy',
      category: 'Fire-Resistant Materials'
    },
    {
      id: 'q4',
      questionText: 'What mesh size should ember-resistant vents have?',
      options: [
        { id: 'o4a', text: '1/4-inch mesh' },
        { id: 'o4b', text: '1/8-inch mesh' },
        { id: 'o4c', text: '1/2-inch mesh' },
        { id: 'o4d', text: '1-inch mesh' },
      ],
      correctOptionId: 'o4b',
      explanation: 'Ember-resistant vents should have 1/8-inch mesh screens to prevent ember intrusion while allowing airflow.',
      difficulty: 'hard',
      category: 'Fire-Resistant Materials'
    },
    // Red Flag Warnings
    {
      id: 'q5',
      questionText: 'What does a Red Flag Warning indicate?',
      options: [
        { id: 'o5a', text: 'Heavy rainfall expected' },
        { id: 'o5b', text: 'Critical fire weather conditions with low humidity and strong winds' },
        { id: 'o5c', text: 'Air quality alert' },
        { id: 'o5d', text: 'Evacuation order issued' },
      ],
      correctOptionId: 'o5b',
      explanation: 'Red Flag Warnings mean warm temperatures, very low humidity, and strong winds create conditions where fires spread quickly.',
      difficulty: 'easy',
      category: 'Fire Weather'
    },
    // Air Quality
    {
      id: 'q6',
      questionText: 'At what AQI level should you stay indoors?',
      options: [
        { id: 'o6a', text: 'Above 50' },
        { id: 'o6b', text: 'Above 100' },
        { id: 'o6c', text: 'Above 150' },
        { id: 'o6d', text: 'Above 200' },
      ],
      correctOptionId: 'o6c',
      explanation: 'AQI above 150 is unhealthy for all groups. Stay indoors with filtered air when possible.',
      difficulty: 'medium',
      category: 'Air Quality'
    },
    {
      id: 'q7',
      questionText: 'What type of mask filters wildfire smoke particles?',
      options: [
        { id: 'o7a', text: 'Cloth mask' },
        { id: 'o7b', text: 'Surgical mask' },
        { id: 'o7c', text: 'N95 or P100 mask' },
        { id: 'o7d', text: 'Bandana' },
      ],
      correctOptionId: 'o7c',
      explanation: 'N95 or P100 respirator masks are rated to filter small smoke particles. Cloth and surgical masks do not provide adequate protection.',
      difficulty: 'easy',
      category: 'Air Quality'
    },
    // Fire Behavior
    {
      id: 'q8',
      questionText: 'Which direction do wildfires spread fastest?',
      options: [
        { id: 'o8a', text: 'Downhill' },
        { id: 'o8b', text: 'Uphill' },
        { id: 'o8c', text: 'On flat terrain' },
        { id: 'o8d', text: 'Direction doesn\'t affect speed' },
      ],
      correctOptionId: 'o8b',
      explanation: 'Fires spread fastest uphill due to preheating of fuel. Speed can double for every 10-degree increase in slope.',
      difficulty: 'medium',
      category: 'Fire Behavior'
    },
    {
      id: 'q9',
      questionText: 'What causes most home ignitions during wildfires?',
      options: [
        { id: 'o9a', text: 'Direct flame contact' },
        { id: 'o9b', text: 'Radiant heat' },
        { id: 'o9c', text: 'Embers landing on/near the home' },
        { id: 'o9d', text: 'Lightning strikes' },
      ],
      correctOptionId: 'o9c',
      explanation: 'Wind-carried embers cause most home ignitions. Embers can travel miles ahead of the main fire front and ignite structures.',
      difficulty: 'hard',
      category: 'Fire Behavior'
    },
    // Evacuation
    {
      id: 'q10',
      questionText: 'When should you evacuate during a wildfire?',
      options: [
        { id: 'o10a', text: 'Only when you see flames' },
        { id: 'o10b', text: 'When ordered by authorities or when you feel unsafe' },
        { id: 'o10c', text: 'After gathering all possessions' },
        { id: 'o10d', text: 'Wait for door-to-door notifications' },
      ],
      correctOptionId: 'o10b',
      explanation: 'Evacuate when ordered by authorities or if you feel unsafe. Don\'t wait to see flames - fires can move faster than you can drive.',
      difficulty: 'easy',
      category: 'Evacuation'
    },
    {
      id: 'q11',
      questionText: 'What should be included in a wildfire go-bag?',
      options: [
        { id: 'o11a', text: 'Important documents, medications, water, and N95 masks' },
        { id: 'o11b', text: 'Just clothing' },
        { id: 'o11c', text: 'Electronics only' },
        { id: 'o11d', text: 'Furniture' },
      ],
      correctOptionId: 'o11a',
      explanation: 'Go-bags should include documents, medications, water (1 gallon/person/day), N95 masks, radio, flashlight, first aid, and pet supplies.',
      difficulty: 'easy',
      category: 'Evacuation'
    },
    // Landscaping
    {
      id: 'q12',
      questionText: 'Which plants are fire-resistant?',
      options: [
        { id: 'o12a', text: 'Eucalyptus and pine' },
        { id: 'o12b', text: 'Lavender, rockrose, and succulents' },
        { id: 'o12c', text: 'Bamboo and juniper' },
        { id: 'o12d', text: 'Dry grasses' },
      ],
      correctOptionId: 'o12b',
      explanation: 'Fire-resistant plants include lavender, rockrose, ice plant, and succulents. Avoid eucalyptus, pine, bamboo, and juniper.',
      difficulty: 'medium',
      category: 'Landscaping'
    },
    {
      id: 'q13',
      questionText: 'How far should tree branches be pruned from structures?',
      options: [
        { id: 'o13a', text: '5 feet' },
        { id: 'o13b', text: '10 feet' },
        { id: 'o13c', text: '15 feet' },
        { id: 'o13d', text: '20 feet' },
      ],
      correctOptionId: 'o13b',
      explanation: 'Prune tree branches to 10 feet from structures and chimneys to prevent fire spread.',
      difficulty: 'medium',
      category: 'Landscaping'
    },
    // Maintenance
    {
      id: 'q14',
      questionText: 'How often should gutters be cleaned during fire season?',
      options: [
        { id: 'o14a', text: 'Once a year' },
        { id: 'o14b', text: 'Every 6 months' },
        { id: 'o14c', text: 'Monthly' },
        { id: 'o14d', text: 'Only after storms' },
      ],
      correctOptionId: 'o14c',
      explanation: 'Clean gutters and roofs monthly during fire season to remove pine needles, leaves, and debris that can ignite from embers.',
      difficulty: 'hard',
      category: 'Maintenance'
    },
    {
      id: 'q15',
      questionText: 'Where should firewood be stored?',
      options: [
        { id: 'o15a', text: 'Against the house' },
        { id: 'o15b', text: '10 feet from structures' },
        { id: 'o15c', text: '30 feet from structures' },
        { id: 'o15d', text: 'In the garage' },
      ],
      correctOptionId: 'o15c',
      explanation: 'Stack firewood at least 30 feet from structures to prevent it from fueling a fire near your home.',
      difficulty: 'medium',
      category: 'Maintenance'
    },
  ];

  // Shuffle and select questions
  const shuffled = questionPool.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { count = 10, difficulty, includeExplanations = true } = body;

    // Generate questions
    let questions = generateWildfireQuestions(count);

    // Filter by difficulty if specified
    if (difficulty) {
      questions = questions.filter(q => q.difficulty === difficulty);
      // If we don't have enough questions of that difficulty, add more
      while (questions.length < count) {
        questions.push(...generateWildfireQuestions(count - questions.length));
      }
      questions = questions.slice(0, count);
    }

    // Remove explanations if not requested
    if (!includeExplanations) {
      questions = questions.map(q => ({ ...q, explanation: '' }));
    }

    return NextResponse.json({
      success: true,
      questions,
      metadata: {
        totalQuestions: questions.length,
        generatedAt: new Date().toISOString(),
        difficulty: difficulty || 'mixed',
        includesExplanations: includeExplanations,
      }
    });
  } catch (error) {
    console.error('Error generating wildfire quiz:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate quiz questions',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

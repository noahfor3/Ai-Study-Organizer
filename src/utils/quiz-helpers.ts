import { QuizQuestion } from '../types/quiz';

export function extractSections(content: string): string[] {
  // Extract section headers and topics from content
  const sections: string[] = [];
  
  // Look for common section patterns
  const sectionPatterns = [
    /^#+\s+(.+)$/gm,           // Markdown headers
    /^[A-Z][A-Z\s]+$/gm,       // ALL CAPS headers
    /^\d+\.\s*([A-Z][^.\n]+)/gm, // Numbered sections
    /^[A-Z][^.\n]*:$/gm        // Colon-ended headers
  ];

  sectionPatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const cleanMatch = match.replace(/^#+\s+/, '').replace(/^\d+\.\s*/, '').replace(':', '').trim();
        if (cleanMatch.length > 3 && cleanMatch.length < 100) {
          sections.push(cleanMatch);
        }
      });
    }
  });

  // If no sections found, create generic ones based on content length
  if (sections.length === 0) {
    const words = content.split(/\s+/).length;
    if (words > 1000) {
      sections.push('Introduction', 'Main Content', 'Conclusion');
    } else {
      sections.push('Content');
    }
  }

  return [...new Set(sections)]; // Remove duplicates
}

export function calculateCoverage(questions: QuizQuestion[], sections: string[]): {
  sections: string[];
  coveragePercentage: number;
} {
  const coveredSections = new Set<string>();
  
  questions.forEach(question => {
    if (question.sourceSection) {
      // Find matching section
      const matchingSection = sections.find(section => 
        section.toLowerCase().includes(question.sourceSection!.toLowerCase()) ||
        question.sourceSection!.toLowerCase().includes(section.toLowerCase())
      );
      
      if (matchingSection) {
        coveredSections.add(matchingSection);
      }
    }
  });

  const coveragePercentage = sections.length > 0 
    ? (coveredSections.size / sections.length) * 100 
    : 100;

  return {
    sections: Array.from(coveredSections),
    coveragePercentage: Math.round(coveragePercentage)
  };
}

export function validateQuestionFormat(question: QuizQuestion): string[] {
  const errors: string[] = [];

  if (!question.stem || question.stem.trim().length < 10) {
    errors.push('Question stem is too short');
  }

  if (question.type === 'mcq') {
    if (!question.options || question.options.length !== 4) {
      errors.push('MCQ must have exactly 4 options');
    } else {
      // Check for duplicate options
      const uniqueOptions = new Set(question.options);
      if (uniqueOptions.size !== question.options.length) {
        errors.push('MCQ options must be unique');
      }
    }

    if (typeof question.correctAnswer !== 'number' || 
        question.correctAnswer < 0 || 
        question.correctAnswer >= (question.options?.length || 0)) {
      errors.push('MCQ correct answer must be a valid option index');
    }
  }

  if (question.type === 'true_false') {
    if (typeof question.correctAnswer !== 'boolean') {
      errors.push('T/F questions must have boolean correct answer');
    }
  }

  if (question.type === 'short_answer') {
    if (typeof question.correctAnswer !== 'string' || question.correctAnswer.trim().length === 0) {
      errors.push('Short answer questions must have non-empty string answer');
    }
  }

  return errors;
}

export function detectAmbiguity(questions: QuizQuestion[]): string[] {
  const warnings: string[] = [];
  const terms = new Map<string, number>();

  // Collect all terms from question stems
  questions.forEach(question => {
    const words = question.stem.toLowerCase().match(/\b\w+\b/g) || [];
    words.forEach(word => {
      if (word.length > 3) { // Only consider longer words
        terms.set(word, (terms.get(word) || 0) + 1);
      }
    });
  });

  // Check for potentially ambiguous terms
  terms.forEach((count, term) => {
    if (count > 1) {
      warnings.push(`Term "${term}" appears in multiple questions - may cause confusion`);
    }
  });

  return warnings;
}

export function exportToJSON(questions: QuizQuestion[], includeMetadata: boolean = true): string {
  const exportData = {
    questions: questions.map(q => ({
      id: q.id,
      type: q.type,
      stem: q.stem,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      difficulty: q.difficulty,
      sourceSection: q.sourceSection,
      ...(includeMetadata && { metadata: q.metadata })
    })),
    exportedAt: new Date().toISOString(),
    totalQuestions: questions.length
  };

  return JSON.stringify(exportData, null, 2);
}

export function exportToCSV(questions: QuizQuestion[], includeMetadata: boolean = true): string {
  const headers = [
    'ID',
    'Type',
    'Stem',
    'Option 1',
    'Option 2', 
    'Option 3',
    'Option 4',
    'Correct Answer',
    'Explanation',
    'Difficulty',
    'Source Section'
  ];

  if (includeMetadata) {
    headers.push('Tokens Used', 'Generated At', 'Source Length');
  }

  const rows = [headers.join(',')];

  questions.forEach(question => {
    const row = [
      question.id,
      question.type,
      `"${question.stem.replace(/"/g, '""')}"`,
      question.options?.[0] ? `"${question.options[0].replace(/"/g, '""')}"` : '',
      question.options?.[1] ? `"${question.options[1].replace(/"/g, '""')}"` : '',
      question.options?.[2] ? `"${question.options[2].replace(/"/g, '""')}"` : '',
      question.options?.[3] ? `"${question.options[3].replace(/"/g, '""')}"` : '',
      typeof question.correctAnswer === 'string' 
        ? `"${question.correctAnswer.replace(/"/g, '""')}"` 
        : question.correctAnswer,
      question.explanation ? `"${question.explanation.replace(/"/g, '""')}"` : '',
      question.difficulty,
      question.sourceSection ? `"${question.sourceSection.replace(/"/g, '""')}"` : ''
    ];

    if (includeMetadata) {
      row.push(
        question.metadata.tokensUsed.toString(),
        question.metadata.generatedAt,
        question.metadata.sourceLength.toString()
      );
    }

    rows.push(row.join(','));
  });

  return rows.join('\n');
}

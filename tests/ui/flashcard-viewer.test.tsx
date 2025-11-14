import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FlashcardViewer from '../../src/components/flashcard-viewer';

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  ArrowLeftCircle: ({ className, ...props }: any) => (
    <svg data-testid="arrow-left-circle-icon" className={className} {...props} />
  ),
  ArrowRightCircle: ({ className, ...props }: any) => (
    <svg data-testid="arrow-right-circle-icon" className={className} {...props} />
  ),
  RefreshCw: ({ className, ...props }: any) => (
    <svg data-testid="refresh-cw-icon" className={className} {...props} />
  ),
  Info: ({ className, ...props }: any) => (
    <svg data-testid="info-icon" className={className} {...props} />
  ),
}));

// Mock UI components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, className, variant, onClick, disabled, ...props }: any) => (
    <button 
      className={className} 
      data-variant={variant}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className, onClick, ...props }: any) => (
    <div 
      className={className} 
      onClick={onClick}
      data-testid="flashcard"
      {...props}
    >
      {children}
    </div>
  ),
  CardContent: ({ children, className, ...props }: any) => (
    <div className={className} {...props}>{children}</div>
  ),
  CardFooter: ({ children, className, ...props }: any) => (
    <div className={className} {...props}>{children}</div>
  ),
  CardHeader: ({ children, className, ...props }: any) => (
    <div className={className} {...props}>{children}</div>
  ),
  CardTitle: ({ children, className, ...props }: any) => (
    <h2 className={className} {...props}>{children}</h2>
  ),
}));

jest.mock('@/components/ui/alert', () => ({
  Alert: ({ children, ...props }: any) => (
    <div data-testid="alert" {...props}>{children}</div>
  ),
  AlertDescription: ({ children, ...props }: any) => (
    <div data-testid="alert-description" {...props}>{children}</div>
  ),
  AlertTitle: ({ children, ...props }: any) => (
    <div data-testid="alert-title" {...props}>{children}</div>
  ),
}));

const sampleFlashcards = [
  { front: 'What is React?', back: 'A JavaScript library for building user interfaces' },
  { front: 'What is JSX?', back: 'A syntax extension for JavaScript that looks like HTML' },
  { front: 'What is a component?', back: 'A reusable piece of UI that can have its own state and props' },
];

describe('FlashcardViewer Component', () => {
  it('renders empty state when no flashcards provided', () => {
    render(<FlashcardViewer flashcards={[]} />);
    
    expect(screen.getByTestId('alert')).toBeInTheDocument();
    expect(screen.getByTestId('alert-title')).toHaveTextContent('No Flashcards');
  });

  it('renders flashcard with initial state', () => {
    render(<FlashcardViewer flashcards={sampleFlashcards} />);
    
    expect(screen.getByText('Card 1 of 3')).toBeInTheDocument();
    expect(screen.getByText('What is React?')).toBeInTheDocument();
    expect(screen.queryByText('A JavaScript library for building user interfaces')).not.toBeInTheDocument();
  });

  it('flips card when clicked', async () => {
    const user = userEvent.setup();
    render(<FlashcardViewer flashcards={sampleFlashcards} />);
    
    const flashcard = screen.getByTestId('flashcard');
    await user.click(flashcard);
    
    expect(screen.getByText('A JavaScript library for building user interfaces')).toBeInTheDocument();
    expect(screen.queryByText('What is React?')).not.toBeInTheDocument();
  });

  it('navigates between cards correctly', async () => {
    const user = userEvent.setup();
    render(<FlashcardViewer flashcards={sampleFlashcards} />);
    
    const nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);
    
    expect(screen.getByText('Card 2 of 3')).toBeInTheDocument();
    expect(screen.getByText('What is JSX?')).toBeInTheDocument();
  });

  it('disables navigation for single flashcard', () => {
    const singleCard = [{ front: 'Question', back: 'Answer' }];
    render(<FlashcardViewer flashcards={singleCard} />);
    
    expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /flip/i })).not.toBeDisabled();
  });
});
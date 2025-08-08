import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface JDInputFormProps {
  onSubmit: (jd: string) => void;
  onSkip: () => void;
}

export function JDInputForm({ onSubmit, onSkip }: JDInputFormProps) {
  const [jobDescription, setJobDescription] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(jobDescription);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="jd" className="mb-2">Job Description</Label>
        <Textarea
          id="jd"
          value={jobDescription}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setJobDescription(e.target.value)}
          rows={8}
          placeholder="Paste the job description here to tailor your resume specifically to this role..."
        />
      </div>
      
      <div className="flex space-x-2">
        <Button type="submit" className="flex-1 cursor-pointer">
          Generate Tailored Resume
        </Button>
        <Button type="button" onClick={onSkip} variant="outline" className="flex-1 cursor-pointer">
          Skip & Generate
        </Button>
      </div>
    </form>
  );
} 
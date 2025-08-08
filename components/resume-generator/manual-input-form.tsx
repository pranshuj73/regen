import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ManualInputFormProps {
  onSubmit: (content: string) => void;
}

export function ManualInputForm({ onSubmit }: ManualInputFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    summary: '',
    experience: '',
    education: '',
    skills: '',
    projects: ''
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const content = `
Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone}

Professional Summary:
${formData.summary}

Work Experience:
${formData.experience}

Education:
${formData.education}

Skills:
${formData.skills}

Projects:
${formData.projects}
    `.trim();
    onSubmit(content);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name" className="mb-2">Full Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="email" className="mb-2">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            required
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="phone" className="mb-2">Phone</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
        />
      </div>

      <div>
        <Label htmlFor="summary" className="mb-2">Professional Summary</Label>
        <Textarea
          id="summary"
          value={formData.summary}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
          rows={3}
          placeholder="Brief overview of your professional background and career objectives..."
        />
      </div>

      <div>
        <Label htmlFor="experience" className="mb-2">Work Experience</Label>
        <Textarea
          id="experience"
          value={formData.experience}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
          rows={6}
          placeholder="List your work experience with company names, positions, dates, and key responsibilities..."
        />
      </div>

      <div>
        <Label htmlFor="education" className="mb-2">Education</Label>
        <Textarea
          id="education"
          value={formData.education}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, education: e.target.value }))}
          rows={3}
          placeholder="List your educational background..."
        />
      </div>

      <div>
        <Label htmlFor="skills" className="mb-2">Skills</Label>
        <Textarea
          id="skills"
          value={formData.skills}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, skills: e.target.value }))}
          rows={3}
          placeholder="List your technical and soft skills..."
        />
      </div>

      <div>
        <Label htmlFor="projects" className="mb-2">Projects (Optional)</Label>
        <Textarea
          id="projects"
          value={formData.projects}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, projects: e.target.value }))}
          rows={4}
          placeholder="Describe any relevant projects you've worked on..."
        />
      </div>

      <Button type="submit" className="w-full cursor-pointer">
        Continue to Job Description
      </Button>
    </form>
  );
} 
import { ResumeContent } from '@/schema/resume';
import { Phone, Mail, Linkedin, Github } from 'lucide-react';

interface PrintResumeProps {
  data: ResumeContent;
}

export function PrintResume({ data }: PrintResumeProps) {
  return (
    <div className="hidden print:block print:absolute print:top-0 print:left-0 print:w-full print:h-full print:bg-white print:z-50">
      <div className="max-w-4xl mx-auto p-4 font-sans text-black bg-white" style={{ 
        fontSize: '11px',
        lineHeight: '1.3'
      }}>
        {/* Contact Info */}
        <div className="text-center mb-4">
          <h1 className="text-xl font-bold mb-1">{data.name}</h1>
          <div className="flex items-baseline justify-center gap-3 text-xs text-gray-600 flex-wrap">
            <div className="flex items-baseline gap-1">
              <Phone size={10} className="flex-shrink-0" style={{ verticalAlign: 'baseline', transform: 'translateY(1px)' }} />
              <a href={`tel:${data.phone}`} className="hover:underline">{data.phone}</a>
            </div>
            <div className="flex items-baseline gap-1">
              <Mail size={10} className="flex-shrink-0" style={{ verticalAlign: 'baseline', transform: 'translateY(1px)' }} />
              <a href={`mailto:${data.email}`} className="hover:underline">{data.email}</a>
            </div>
            {data.linkedin && (
              <div className="flex items-baseline gap-1">
                <Linkedin size={10} className="flex-shrink-0" style={{ verticalAlign: 'baseline', transform: 'translateY(1px)' }} />
                <a 
                  href={`https://linkedin.com/in/${data.linkedin}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:underline"
                  title={`LinkedIn: ${data.linkedin}`}
                >
                  LinkedIn
                </a>
              </div>
            )}
            {data.github && (
              <div className="flex items-baseline gap-1">
                <Github size={10} className="flex-shrink-0" style={{ verticalAlign: 'baseline', transform: 'translateY(1px)' }} />
                <a 
                  href={`https://github.com/${data.github}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:underline"
                  title={`GitHub: ${data.github}`}
                >
                  GitHub
                </a>
              </div>
            )}
          </div>
        </div>
        
        {/* SUMMARY */}
        {data.summary && (
          <div className="mb-4">
            <h2 className="text-sm font-bold border-b border-black pb-1 mb-2 uppercase">SUMMARY</h2>
            <p className="text-xs leading-relaxed">{data.summary}</p>
          </div>
        )}
        
        {/* TECHNICAL SKILLS */}
        <div className="mb-4">
          <h2 className="text-sm font-bold border-b border-black pb-1 mb-2 uppercase">TECHNICAL SKILLS</h2>
          <p className="text-xs mb-1"><strong>Languages:</strong> {data.technical_skills.languages.join(', ')}</p>
          <p className="text-xs mb-1"><strong>Frameworks:</strong> {data.technical_skills.frameworks.join(', ')}</p>
          <p className="text-xs mb-1"><strong>Development Tools:</strong> {data.technical_skills.development_tools.join(', ')}</p>
          <p className="text-xs mb-1"><strong>Libraries:</strong> {data.technical_skills.libraries.join(', ')}</p>
        </div>
        
        {/* EXPERIENCE */}
        <div className="mb-4">
          <h2 className="text-sm font-bold border-b border-black pb-1 mb-2 uppercase">EXPERIENCE</h2>
          {data.experience.map((exp, index) => (
            <div key={index} className="mb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xs font-bold">{exp.position}</h3>
                  <p className="text-xs text-gray-600">{exp.organization}</p>
                </div>
                <div className="text-right text-xs text-gray-600">
                  <p>{exp.location}</p>
                  <p>{exp.duration}</p>
                </div>
              </div>
              <ul className="mt-1 ml-4 space-y-0.5">
                {exp.responsibilities.map((resp, respIndex) => (
                  <li key={respIndex} className="text-xs leading-relaxed">• {resp}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        {/* PROJECTS */}
        {data.projects && data.projects.length > 0 && (
          <div className="mb-4">
            <h2 className="text-sm font-bold border-b border-black pb-1 mb-2 uppercase">PROJECTS</h2>
            {data.projects.map((project, index) => (
              <div key={index} className="mb-3">
                <div>
                  <h3 className="text-xs font-bold">{project.title}</h3>
                  <p className="text-xs text-gray-600 mb-1">
                    <strong>Technologies:</strong> {project.technologies.join(', ')}
                  </p>
                </div>
                <p className="text-xs leading-relaxed">{project.description}</p>
              </div>
            ))}
          </div>
        )}
        
        {/* EDUCATION */}
        <div className="mb-4">
          <h2 className="text-sm font-bold border-b border-black pb-1 mb-2 uppercase">EDUCATION</h2>
          {data.education.map((edu, index) => (
            <div key={index} className="mb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xs font-bold">{edu.institution}</h3>
                  <p className="text-xs text-gray-600">{edu.degree}</p>
                </div>
                <div className="text-right text-xs text-gray-600">
                  <p>{edu.location}</p>
                  <p>{edu.duration}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* CERTIFICATIONS */}
        {data.certifications && data.certifications.length > 0 && (
          <div className="mb-4">
            <h2 className="text-sm font-bold border-b border-black pb-1 mb-2 uppercase">CERTIFICATIONS</h2>
            <ul className="ml-4 space-y-0.5">
              {data.certifications.map((cert, index) => (
                <li key={index} className="text-xs leading-relaxed">• {cert}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
} 
import { Lightbulb } from 'lucide-react';

interface HealthierAlternativesProps {
  alternatives: string[] | null;
  context: string | null;
}

export function HealthierAlternatives({ alternatives, context }: HealthierAlternativesProps) {
  if (!alternatives?.length && !context) return null;

  return (
    <div className="space-y-4">
      {context && (
        <div className="p-4 bg-secondary/50 rounded-xl">
          <p className="text-sm text-foreground leading-relaxed">{context}</p>
        </div>
      )}

      {alternatives && alternatives.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            <h4 className="font-medium text-foreground">Healthier Alternatives</h4>
          </div>
          
          <ul className="space-y-2">
            {alternatives.map((alt, index) => (
              <li 
                key={index}
                className="flex items-start gap-3 p-3 bg-accent/30 rounded-lg"
              >
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-primary">{index + 1}</span>
                </div>
                <span className="text-sm text-foreground">{alt}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

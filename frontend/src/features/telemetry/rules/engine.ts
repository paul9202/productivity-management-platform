import { Rule, RuleContext } from './types';
import { InsightItem } from '../../../types/telemetry';

// Helper to clamp confidence
const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);

export class RuleEngine {
    private rules: Rule[] = [];

    constructor(rules: Rule[]) {
        this.rules = rules;
    }

    public evaluateAll(ctx: RuleContext): InsightItem[] {
        const insights: InsightItem[] = [];

        for (const rule of this.rules) {
            try {
                const result = rule.evaluate(ctx);
                if (result) {
                    // Refine confidence based on generic heuristics if needed, 
                    // but we expect the rule to handle most of it.
                    // Check for combos?

                    insights.push(result);
                }
            } catch (e) {
                console.error(`Error evaluating rule ${rule.id}:`, e);
            }
        }

        // Post-processing: Sort by Severity then Confidence
        return insights.sort((a, b) => {
            const severityScore = { 'P1': 3, 'P2': 2, 'P3': 1 };
            if (severityScore[b.severity] !== severityScore[a.severity]) {
                return severityScore[b.severity] - severityScore[a.severity];
            }
            return b.confidence - a.confidence;
        });
    }
}

export type InputMethod = 'upload' | 'paste' | 'git-url' | 'local-path';

export interface DependencyRisk {
	name: string;
	version: string;
	risk_score: number;
	risk_level: 'critical' | 'high' | 'medium' | 'low';
	rationale: string;
}

export interface AnalysisResult {
	ecosystem: string;
	total_dependencies: number;
	overall_score: number;
	overall_explanation: string;
	risk_summary: {
		critical: number;
		high: number;
		medium: number;
		low: number;
	};
	dependencies: DependencyRisk[];
	recommendations: string[];
}

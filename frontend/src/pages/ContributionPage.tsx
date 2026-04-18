import { SectionCard } from "../components/SectionCard";
import type { CampaignData } from "../data/types";

interface ContributionPageProps {
  data: CampaignData;
}

export function ContributionPage({ data }: ContributionPageProps) {
  return (
    <div className="page-grid">
      <SectionCard
        title="Campaign Parameters"
        subtitle="Institutions contribute selected data under policy, and contribution quality directly affects benchmark strength."
      >
        <div className="details-grid">
          <div className="metric-block">
            <span className="eyebrow">Campaign Title</span>
            <strong>{data.title}</strong>
          </div>
          <div className="metric-block">
            <span className="eyebrow">Scenario / Cohort</span>
            <strong>{data.scenario}</strong>
          </div>
          <div className="metric-block">
            <span className="eyebrow">Minimum Reputation Threshold</span>
            <strong>{data.minimumReputationThreshold}</strong>
          </div>
          <div className="metric-block">
            <span className="eyebrow">Contribution Reward</span>
            <strong>{data.contributionReward}</strong>
          </div>
          <div className="metric-block">
            <span className="eyebrow">Participation Status</span>
            <strong>{data.participationStatus}</strong>
          </div>
          <div className="metric-block">
            <span className="eyebrow">Contributor Quality Tier</span>
            <strong>{data.contributorQualityTier}</strong>
          </div>
          <div className="metric-block">
            <span className="eyebrow">Confidence Tier</span>
            <strong>{data.confidenceTier}</strong>
          </div>
          <div className="metric-block">
            <span className="eyebrow">TEE Processing Enabled</span>
            <strong>{data.teeProcessingEnabled}</strong>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Requested Fields">
        <div className="tag-list">
          {data.requestedFields.map((field) => (
            <span key={field} className="tag">
              {field}
            </span>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Contribution Types">
        <div className="tag-list">
          {data.contributionTypes.map((item) => (
            <span key={item} className="tag tag--accent">
              {item}
            </span>
          ))}
        </div>
        <p className="section-note">
          Not all contributions are equal. Higher-assurance submissions carry more weight in the final
          trust-weighted benchmark and benchmark reliability score.
        </p>
      </SectionCard>

      <SectionCard title="Contribution Policy Summary">
        <p>{data.policySummary}</p>
      </SectionCard>
    </div>
  );
}


interface MetaTagsCardProps {
  data: {
    url: string;
    title: string;
    description: string;
  };
}

export function MetaTagsCard({ data }: MetaTagsCardProps) {
  return (
    <div className="meta-card">
      <div className="meta-card-label">Page checked</div>
      <h4 className="meta-card-title">{data.title}</h4>
      <p className="meta-card-description">{data.description}</p>
      <a
        href={data.url}
        target="_blank"
        rel="noopener noreferrer"
        className="meta-card-link"
      >
        {data.url}
      </a>
    </div>
  );
}
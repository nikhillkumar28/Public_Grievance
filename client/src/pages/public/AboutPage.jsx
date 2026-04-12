export default function AboutPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-bold text-civic-navy">About the Platform</h1>
      <div className="mt-5 space-y-4 text-slate-700">
        <p>
          This platform is a smart civic grievance system that allows citizens to report public issues and track their resolution in real time.
          It uses machine learning to automatically classify complaints and identify urgency, helping authorities respond more efficiently.
        </p>
        <p>
          Users can also view similar issues and upvote existing complaints, reducing duplication and improving visibility of critical problems.
        </p>
        <p>
          With transparent status updates and structured dashboards, the platform promotes accountability and better communication between citizens
          and authorities.
        </p>
      </div>
    </main>
  );
}

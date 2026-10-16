export default function RootPage() {
  return (
    <div className="p-8 text-center text-sm font-sans text-slate-600">
      <script
        dangerouslySetInnerHTML={{
          __html: `
            if (window.location.hash) {
              window.location.replace('/en');
            } else {
              window.location.replace('/en');
            }
          `,
        }}
      />
      Redirecting to Fiscal Insights...
    </div>
  );
}

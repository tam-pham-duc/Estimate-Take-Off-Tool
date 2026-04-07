import EstimatorApp from "@/components/EstimatorApp";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Construction Estimator</h1>
        <EstimatorApp />
      </div>
    </main>
  );
}

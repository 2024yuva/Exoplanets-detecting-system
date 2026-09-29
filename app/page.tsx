import Dashboard from "@/components/Dashboard";
import ExoplanetExplorer from "@/components/ExoplanetExplorer";

export const metadata = {
  title: "ExoScope | Worlds beyond our solar system",
  description: "Explore and compare exoplanets through an interactive, data-led experience.",
};

export default function Home() {
  return <>
    <main className="relative z-10">
      <Dashboard />
    </main>
    <ExoplanetExplorer />
  </>;
}

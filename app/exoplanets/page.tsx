import ExoplanetExplorer from "@/components/ExoplanetExplorer";

export const metadata = {
    title: "Exoplanet Catalog | ExoScope",
    description: "Browse project exoplanet data and observed light curves.",
};

export default function ExoplanetsPage() {
    return <ExoplanetExplorer />;
}

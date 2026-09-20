import type { Metadata } from "next";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { fetchLocationMetadata } from "@/features/locations/api/fetch-location-metadata";
import { LocationDetailView } from "@/features/locations/components/location-detail-view";

export async function generateMetadata({
  params,
}: PageProps<"/locations/[id]">): Promise<Metadata> {
  const { id } = await params;
  const location = await fetchLocationMetadata(id);

  if (!location) {
    return {
      title: "Location not found | Multiverse Explorer",
      description:
        "This location could not be found in the multiverse archive.",
    };
  }

  return {
    title: `${location.name} | Multiverse Explorer`,
    description: `${location.name} -- type: ${location.type}. See its full resident list on Multiverse Explorer.`,
  };
}

export default async function LocationDetailPage({
  params,
}: PageProps<"/locations/[id]">) {
  const { id } = await params;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <ErrorBoundary>
        <LocationDetailView id={id} />
      </ErrorBoundary>
    </main>
  );
}

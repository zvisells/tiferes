import { supabase } from '@/lib/supabaseClient';
import ShiurDetailContent from './detail-content';

export default async function ShiurDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;

  // Fetch shiur on server side
  const { data: shiur, error } = await supabase
    .from('shiurim')
    .select('*')
    .eq('slug', resolvedParams.slug)
    .single();

  if (error || !shiur) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        Shiur not found.
      </div>
    );
  }

  return (
    <ShiurDetailContent shiur={shiur} />
  );
}

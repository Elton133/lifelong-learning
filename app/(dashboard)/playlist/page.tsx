'use client';

import { useState } from 'react';
import { RefreshCw, Filter } from 'lucide-react';
import { usePlaylist, useContentList } from '@/hooks/usePlaylist';
import { PlaylistCard } from '@/components/dashboard/PlaylistCard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-10 w-64 bg-muted rounded-lg" />
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-32 bg-muted rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default function PlaylistPage() {
  const { playlist, loading: playlistLoading, generateNew } = usePlaylist();
  const { contents, loading: contentsLoading } = useContentList();
  const [isGenerating, setIsGenerating] = useState(false);
  const [filter, setFilter] = useState<string | null>(null);

  const loading = playlistLoading || contentsLoading;

  if (loading) {
    return <LoadingSkeleton />;
  }

  const handleGenerateNew = async () => {
    setIsGenerating(true);
    try {
      await generateNew();
    } finally {
      setIsGenerating(false);
    }
  };

  const contentTypes = ['video', 'quiz', 'interactive', 'scenario', 'sandbox'];
  const displayContents = filter 
    ? contents.filter(c => c.content_type === filter)
    : playlist?.contents || contents;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Learning Playlist</h1>
          <p className="text-muted-foreground mt-1">
            {playlist?.description || 'Your personalized learning content'}
          </p>
        </div>
        <Button 
          onClick={handleGenerateNew}
          disabled={isGenerating}
          className="sm:w-auto"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
          Generate New Playlist
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
        <Button
          variant={filter === null ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilter(null)}
          className="shrink-0"
        >
          All
        </Button>
        {contentTypes.map(type => (
          <Button
            key={type}
            variant={filter === type ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter(type)}
            className="shrink-0 capitalize"
          >
            {type}
          </Button>
        ))}
      </div>

      {/* Content List */}
      {displayContents.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No content available.</p>
          <Button onClick={handleGenerateNew} className="mt-4">
            Generate Playlist
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {displayContents.map((content, index) => (
            <PlaylistCard 
              key={content.id} 
              content={content} 
              index={filter === null ? index : undefined}
            />
          ))}
        </div>
      )}

      {/* All Available Content */}
      {!filter && contents.length > (playlist?.contents?.length || 0) && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">More Learning Content</h2>
          <div className="space-y-4">
            {contents
              .filter(c => !playlist?.content_ids?.includes(c.id))
              .map(content => (
                <PlaylistCard key={content.id} content={content} />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

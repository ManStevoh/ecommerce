'use client';

import { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from '@nexora/ui';
import { fetchMedia, createMedia, uploadMedia } from '@/lib/api';

export default function MediaPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: assets, isLoading } = useQuery({
    queryKey: ['media'],
    queryFn: fetchMedia,
  });
  const [url, setUrl] = useState('');
  const [filename, setFilename] = useState('');
  const [altText, setAltText] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);

  const createMut = useMutation({
    mutationFn: () =>
      createMedia({
        filename: filename || url.split('/').pop() || 'asset',
        url,
        altText: altText || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
      setUrl('');
      setFilename('');
      setAltText('');
    },
  });

  const uploadMut = useMutation({
    mutationFn: (file: File) => uploadMedia(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
      setUploadError(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    onError: (err) => {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    },
  });

  function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadMut.mutate(file);
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Media library</h1>
        <p className="text-zinc-500">Upload files or add assets by URL</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upload file</CardTitle>
          <CardDescription>Images, video, or PDF up to 10 MB</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label htmlFor="media-file">Choose file</Label>
            <input
              id="media-file"
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*,application/pdf"
              className="flex h-10 w-full cursor-pointer rounded-lg border border-zinc-200 bg-white/80 px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-1 file:text-sm file:font-medium file:text-indigo-700"
              onChange={onFileSelected}
              disabled={uploadMut.isPending}
            />
          </div>
          {uploadMut.isPending && (
            <p className="text-sm text-zinc-500">Uploading…</p>
          )}
          {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Add media by URL</CardTitle>
          <CardDescription>Link to an external asset</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Input
            placeholder="https://…"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="min-w-[240px] flex-1"
          />
          <Input
            placeholder="Filename"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
          />
          <Input
            placeholder="Alt text"
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
          />
          <Button
            onClick={() => createMut.mutate()}
            disabled={!url || createMut.isPending}
          >
            Add
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Assets</CardTitle>
          <CardDescription>
            {assets?.length
              ? `${assets.length} item${assets.length === 1 ? '' : 's'}`
              : 'No assets uploaded yet'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-zinc-500">Loading…</p>
          ) : !assets?.length ? (
            <p className="py-8 text-center text-zinc-500">
              Upload a file or add a URL to populate your library.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {assets.map((a) => (
                <Card key={a.id} className="overflow-hidden">
                  <div className="aspect-video bg-zinc-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={a.url}
                      alt={a.altText ?? a.filename}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <CardContent className="p-3 text-sm">
                    <p className="font-medium truncate">{a.filename}</p>
                    <p className="text-zinc-500 truncate">{a.url}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

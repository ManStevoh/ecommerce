"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input } from "@nexora/ui";
import { useState } from "react";
import { fetchPages, createPage, publishPage } from "@/lib/cms-api";

export default function CmsPagesPage() {
  const queryClient = useQueryClient();
  const { data: pages, isLoading } = useQuery({ queryKey: ["cms-pages"], queryFn: fetchPages });
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");

  const createMut = useMutation({
    mutationFn: () =>
      createPage({
        title,
        slug: slug || title.toLowerCase().replace(/\s+/g, "-"),
        status: "DRAFT",
        blocks: [
          {
            type: "HERO",
            sortOrder: 0,
            config: { headline: title, subheadline: "Welcome to our store" },
          },
        ],
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cms-pages"] });
      setTitle("");
      setSlug("");
    },
  });

  const publishMut = useMutation({
    mutationFn: (id: string) => publishPage(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cms-pages"] }),
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Landing Pages</h1>
        <p className="text-zinc-500">CMS pages with drag-drop blocks (hero, CTA, FAQ, …)</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Create page</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Input placeholder="Page title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input placeholder="slug (optional)" value={slug} onChange={(e) => setSlug(e.target.value)} />
          <Button onClick={() => createMut.mutate()} disabled={!title || createMut.isPending}>
            Create draft
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All pages</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-zinc-500">Loading…</p>
          ) : !pages?.length ? (
            <p className="text-zinc-500">No pages yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-zinc-500">
                  <th className="pb-3 pr-4">Title</th>
                  <th className="pb-3 pr-4">Slug</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pages.map((p) => (
                  <tr key={p.id} className="border-b border-zinc-100">
                    <td className="py-3 pr-4 font-medium">{p.title}</td>
                    <td className="py-3 pr-4 text-zinc-500">/pages/{p.slug}</td>
                    <td className="py-3 pr-4">
                      <Badge variant={p.status === "PUBLISHED" ? "success" : "secondary"}>
                        {p.status}
                      </Badge>
                    </td>
                    <td className="py-3">
                      {p.status !== "PUBLISHED" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => publishMut.mutate(p.id)}
                          disabled={publishMut.isPending}
                        >
                          Publish
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

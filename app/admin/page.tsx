"use client";

import { useState, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AuthGuard } from "@/components/auth-guard";
import { SiteHeader } from "@/components/site-header";
import { Upload, Film } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";

function AdminContent() {
  const videos = useQuery(api.videos.list);
  const createVideo = useMutation(api.videos.create);
  const generateUploadUrl = useMutation(api.videos.generateUploadUrl);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [collection, setCollection] = useState("Everyday");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [duration, setDuration] = useState("");
  const [featured, setFeatured] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState("");

  const videoFileRef = useRef<HTMLInputElement>(null);
  const thumbnailFileRef = useRef<HTMLInputElement>(null);

  const collections = [
    "Summer Trips",
    "Birthdays",
    "Holidays",
    "Celebrations",
    "Everyday",
  ];

  async function uploadFile(file: File): Promise<Id<"_storage">> {
    const url = await generateUploadUrl();
    const result = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });
    const { storageId } = await result.json();
    return storageId;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setUploading(true);
    setStatus("Uploading...");

    try {
      let storageId: Id<"_storage"> | undefined;
      let thumbnailStorageId: Id<"_storage"> | undefined;

      const videoFile = videoFileRef.current?.files?.[0];
      const thumbnailFile = thumbnailFileRef.current?.files?.[0];

      if (videoFile) {
        setStatus("Uploading video...");
        storageId = await uploadFile(videoFile);
      }

      if (thumbnailFile) {
        setStatus("Uploading thumbnail...");
        thumbnailStorageId = await uploadFile(thumbnailFile);
      }

      setStatus("Saving...");
      await createVideo({
        title,
        description,
        collection,
        year,
        duration,
        featured: featured || undefined,
        storageId,
        thumbnailStorageId,
      });

      // Reset form
      setTitle("");
      setDescription("");
      setCollection("Everyday");
      setYear(new Date().getFullYear().toString());
      setDuration("");
      setFeatured(false);
      if (videoFileRef.current) videoFileRef.current.value = "";
      if (thumbnailFileRef.current) thumbnailFileRef.current.value = "";
      setStatus("Video added!");
      setTimeout(() => setStatus(""), 3000);
    } catch {
      setStatus("Something went wrong. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="min-h-dvh bg-background">
      <SiteHeader />

      <div className="mx-auto max-w-4xl px-6 py-10 md:px-10">
        <div className="grid gap-12 lg:grid-cols-[1fr,1.2fr]">
          {/* Upload form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <h2 className="font-mono text-[0.7rem] uppercase tracking-[0.35em] text-primary">
              New Video
            </h2>

            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="rounded-xl border border-border bg-card px-4 py-3 text-base text-foreground outline-none transition-colors focus:border-primary sm:text-sm"
                placeholder="A Whole Day at the Shore"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={3}
                className="rounded-xl border border-border bg-card px-4 py-3 text-base text-foreground outline-none transition-colors focus:border-primary sm:text-sm"
                placeholder="Sun, sandcastles, and the kids racing the tide."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
                  Collection
                </label>
                <select
                  value={collection}
                  onChange={(e) => setCollection(e.target.value)}
                  className="rounded-xl border border-border bg-card px-4 py-3 text-base text-foreground outline-none transition-colors focus:border-primary sm:text-sm"
                >
                  {collections.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
                  Year
                </label>
                <input
                  type="text"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  required
                  className="rounded-xl border border-border bg-card px-4 py-3 text-base text-foreground outline-none transition-colors focus:border-primary sm:text-sm"
                  placeholder="2024"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
                  Duration
                </label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  required
                  className="rounded-xl border border-border bg-card px-4 py-3 text-base text-foreground outline-none transition-colors focus:border-primary sm:text-sm"
                  placeholder="12:04"
                />
              </div>

              <div className="flex flex-col items-start gap-1.5">
                <label className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
                  Featured
                </label>
                <label className="flex items-center gap-2 py-3 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="h-4 w-4 rounded border-border accent-primary"
                  />
                  Hero spotlight
                </label>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
                Video File
              </label>
              <input
                ref={videoFileRef}
                type="file"
                accept="video/*"
                className="text-sm text-muted-foreground file:mr-3 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
                Thumbnail Image
              </label>
              <input
                ref={thumbnailFileRef}
                type="file"
                accept="image/*"
                className="text-sm text-muted-foreground file:mr-3 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground"
              />
            </div>

            {status && (
              <p className="text-sm text-primary">{status}</p>
            )}

            <button
              type="submit"
              disabled={uploading}
              className="mt-2 flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <Upload className="h-4 w-4" />
              {uploading ? "Uploading..." : "Add Video"}
            </button>
          </form>

          {/* Existing videos list */}
          <div>
            <h2 className="font-mono text-[0.7rem] uppercase tracking-[0.35em] text-primary">
              Library ({videos?.length ?? 0} videos)
            </h2>
            <div className="mt-4 flex flex-col gap-3">
              {videos?.map((video) => (
                <div
                  key={video._id}
                  className="flex items-center gap-4 rounded-xl border border-border bg-card p-4"
                >
                  <Film className="h-5 w-5 shrink-0 text-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {video.title}
                    </p>
                    <p className="font-mono text-[0.6rem] uppercase tracking-widest text-muted-foreground">
                      {video.collection} &middot; {video.year} &middot;{" "}
                      {video.duration}
                    </p>
                  </div>
                </div>
              ))}
              {videos?.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No videos yet. Upload your first one!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <AuthGuard>
      <AdminContent />
    </AuthGuard>
  );
}

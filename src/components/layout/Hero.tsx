"use client";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Sparkles, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Hero() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = query.trim() ? `?search=${encodeURIComponent(query.trim())}` : "";
    router.push(`/courses${params}`);
  }

  return (
    <section className="relative overflow-hidden ">
      <div className="mx-auto grid max-w-7xl grid-cols-1  items-center gap-12 px-6 py-16 lg:grid-cols-2 lg:py-24">
        {/* Left: Text + Search */}
        <div className="space-y-6 ">
          <h1 className="font-heading text-4xl leading-tight sm:text-5xl">
            Best <span className="text-highlight">courses</span> are waiting
            to enrich your skill
          </h1>

          <p className="max-w-md text-muted-foreground">
            Provides you with the latest online learning system and material
            that help your knowledge growing.
          </p>

          <form
            onSubmit={handleSearch}
            className="flex max-w-md items-center gap-2 rounded-full border border-border bg-white p-1.5 pl-4"
          >
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Want to learn?"
              className="h-8 flex-1 border-none bg-transparent text-black shadow-none focus-visible:ring-0"
            />
            <Button type="submit" render={<button type="submit" />} className="rounded-full">
              Explore
            </Button>
          </form>
        </div>

        {/* Right: Illustration */}
<div className="relative flex w-full justify-center overflow-visible">
  {/* <div className="absolute h-72 w-72 rounded-[3rem] bg-primary/20 sm:h-96 sm:w-96" /> */}

  <Image
    src="/Hero.png"
    alt="LMS learning illustration"
    width={2048}
    height={720}
    priority
    className="relative z-10 block h-auto lg:w-[800px] md:w-[700px]  w-[500px] max-w-none shrink-0 object-contain animate-float motion-reduce:animate-none"
  />


  {/* Decorative floating shapes */}
  <span className="absolute -top-4 left-6 z-20 flex h-12 w-12 items-center justify-center rounded-2xl bg-card shadow-lg">
    <Mail className="h-5 w-7 text-fuchsia-500 animate-pulse" />
  </span>
  <span className="absolute bottom-4 -right-2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-accent">
    <Sparkles className="h-4 w-4 text-lime-400 animate-pulse " />
  </span>
</div>

</div>
      
    </section>
  );
}
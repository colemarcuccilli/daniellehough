import Image from "next/image";
import Link from "next/link";
import type { WeddingProject } from "@/lib/queries";
import { photoUrl } from "@/lib/images";
import { pluralize } from "@/lib/utils";

export function WeddingProjectCard({ project, priority }: { project: WeddingProject; priority?: boolean }) {
  const cover = project.cover ?? project.thumb;
  return (
    <Link href={project.href} className="group block overflow-hidden outline-card-soft transition-colors hover:border-sage">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-cream-deep" style={{ backgroundColor: cover?.dominant_color ?? undefined }}>
        {cover ? (
          <Image
            src={photoUrl(cover.web_path)}
            alt={project.title}
            fill
            priority={priority}
            sizes="(max-width: 640px) 100vw, 50vw"
            quality={75}
            placeholder={cover.blur_data_url ? "blur" : "empty"}
            blurDataURL={cover.blur_data_url ?? undefined}
            className="object-cover object-[center_30%] transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
        ) : null}
      </div>
      <div className="flex items-start justify-between gap-4 border-t border-line p-5">
        <div className="min-w-0">
          <h3 className="display text-3xl leading-tight sm:text-4xl">{project.title}</h3>
          <p className="caps mt-2 text-[0.6rem] text-sage">{project.kind}</p>
        </div>
        <div className="caps shrink-0 text-right text-[0.58rem] leading-5 text-ink-faint">
          <div>{project.place}</div>
          <div>{pluralize(project.photo_count, "photo")}</div>
        </div>
      </div>
    </Link>
  );
}

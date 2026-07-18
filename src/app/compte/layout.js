import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ClientSidebar } from "@/components/dashboard/ClientSidebar";
import { ZigzagDivider } from "@/components/ZigzagDivider";

export default async function CompteLayout({ children }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/compte");

  return (
    <div className="flex min-h-screen flex-col">
      {/* sticky : le bandeau "Mon compte" reste visible en haut, hors du
          scroll du contenu, meme quand on defile sur les pages longues */}
      <div className="sticky top-0 z-40">
        <div className="bg-navy-900 py-6 text-white" data-aos="fade">
          <div className="mx-auto flex max-w-5xl items-center justify-center gap-3 px-4 md:px-6">
            {/* Texte creux : fond transparent + contour blanc via
                -webkit-text-stroke, agrandi pour un effet de titre fort */}
            <h1 className="select-none font-display text-5xl font-extrabold uppercase tracking-wide text-transparent md:text-7xl [-webkit-text-stroke:1.5px_white] md:[-webkit-text-stroke:2px_white]">
              Mon compte
            </h1>
          </div>
        </div>
        <ZigzagDivider color="var(--color-navy-900)" flip />
      </div>

      <ClientSidebar />

      {/* pl-56 reserve la place de la sidebar desktop ; pb-16 laisse la place
          a la barre de nav mobile fixee en bas pour ne pas cacher le
          contenu. flex-1 + min-h-screen sur le parent : la page garde
          toujours la hauteur de l'ecran, meme quand children est vide. */}
      <div className="flex-1 pb-16 lg:pb-0 lg:pl-56">
        <div className="mx-auto max-w-4xl px-4 py-6 md:px-6" data-aos="fade-up">
          {children}
        </div>
      </div>
    </div>
  );
}

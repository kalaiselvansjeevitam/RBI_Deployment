/* eslint-disable react-hooks/static-components */
import { Download } from "lucide-react";
import { useMemo, useState } from "react";
import Layout from "../../../app/components/Layout/Layout";
import { Button } from "../../../app/components/ui/button";

type Language = "English" | "Marathi";

type MaterialType = "Handbook" | "Banner" | "Videos";

type MaterialConfig = {
  title: MaterialType;
  description: string;
  // Placeholder links by language (keep null for now)
  downloads: Record<Language, { label: string; href: string | null }[]>;
};

const IECMaterials = () => {
  const [handbookLang, setHandbookLang] = useState<Language>("English");
  const [bannerLang, setBannerLang] = useState<Language>("English");
  const [videosLang, setVideosLang] = useState<Language>("English");

  const materials = useMemo<MaterialConfig[]>(
    () => [
      {
        title: "Handbook",
        description: "Download participant handbooks (placeholder for now).",
        downloads: {
          English: [{ label: "Handbook (English) - Coming soon", href: null }],
          Marathi: [{ label: "Handbook (Marathi) - Coming soon", href: null }],
        },
      },
      {
        title: "Banner",
        description:
          "Download banners for session venue (placeholder for now).",
        downloads: {
          English: [{ label: "Banner (English) - Coming soon", href: null }],
          Marathi: [{ label: "Banner (Marathi) - Coming soon", href: null }],
        },
      },
      {
        title: "Videos",
        description: "Download RBI-approved videos (placeholder for now).",
        downloads: {
          English: [
            { label: "Video Pack (English) - Coming soon", href: null },
          ],
          Marathi: [
            { label: "Video Pack (Marathi) - Coming soon", href: null },
          ],
        },
      },
    ],
    [],
  );

  const LanguageSelect = ({
    value,
    onChange,
    id,
  }: {
    value: Language;
    onChange: (v: Language) => void;
    id: string;
  }) => (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value as Language)}
      className="w-full md:w-44 border rounded-lg px-3 py-2 text-sm bg-white"
    >
      <option value="English">English</option>
      <option value="Marathi">Marathi</option>
    </select>
  );

  const SectionCard = ({
    title,
    description,
    lang,
    onLangChange,
    items,
  }: {
    title: MaterialType;
    description: string;
    lang: Language;
    onLangChange: (v: Language) => void;
    items: { label: string; href: string | null }[];
  }) => {
    return (
      <div className="bg-white rounded-2xl shadow p-6 bg-gradient-to-br from-white to-gray-50 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Language</span>
            <LanguageSelect
              id={`${title}-lang`}
              value={lang}
              onChange={onLangChange}
            />
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {items.map((d, idx) => {
            const disabled = !d.href;
            return (
              <div
                key={`${title}-${idx}`}
                className="flex items-center justify-between border rounded-xl p-4 bg-white"
              >
                <div className="text-sm text-gray-700">{d.label}</div>
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2"
                  disabled={disabled}
                  onClick={() => {
                    if (!d.href) return;
                    window.open(d.href, "_blank", "noopener,noreferrer");
                  }}
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const handbookItems = materials.find((m) => m.title === "Handbook")!
    .downloads[handbookLang];
  const bannerItems = materials.find((m) => m.title === "Banner")!.downloads[
    bannerLang
  ];
  const videoItems = materials.find((m) => m.title === "Videos")!.downloads[
    videosLang
  ];

  return (
    <Layout headerTitle="IEC Materials">
      <div className="p-6 space-y-6">
        <SectionCard
          title="Handbook"
          description={
            materials.find((m) => m.title === "Handbook")!.description
          }
          lang={handbookLang}
          onLangChange={setHandbookLang}
          items={handbookItems}
        />

        <SectionCard
          title="Banner"
          description={materials.find((m) => m.title === "Banner")!.description}
          lang={bannerLang}
          onLangChange={setBannerLang}
          items={bannerItems}
        />

        <SectionCard
          title="Videos"
          description={materials.find((m) => m.title === "Videos")!.description}
          lang={videosLang}
          onLangChange={setVideosLang}
          items={videoItems}
        />
      </div>
    </Layout>
  );
};

export default IECMaterials;

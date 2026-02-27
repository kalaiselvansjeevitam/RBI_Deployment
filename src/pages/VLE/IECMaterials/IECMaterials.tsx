/* eslint-disable react-hooks/static-components */
import { PlayCircle } from "lucide-react";
import { useMemo, useState } from "react";
import Layout from "../../../app/components/Layout/Layout";
import { Button } from "../../../app/components/ui/button";

import banner from "../../../assets/images/RBIbanner.pdf";
import script_1 from "../../../assets/images/Hindi - Script on How to Guide About UPI123PAY.pdf";
import script_2 from "../../../assets/images/HIndi - Script on How to Guide about UPI.pdf";
type Language = "Hindi" | "Marathi";

type MaterialType = "Handbook" | "Banner" | "Videos" | "Script Files";

type MaterialConfig = {
  title: MaterialType;
  description: string;
  // Placeholder links by language (keep null for now)
  downloads: Record<Language, { label: string; href: string | null }[]>;
};
const downloadFile = (url: string, filename: string) => {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const IECMaterials = () => {
  const [handbookLang, setHandbookLang] = useState<Language>("Hindi");
  const [bannerLang, setBannerLang] = useState<Language>("Hindi");
  const [scriptLang, setscriptLang] = useState<Language>("Hindi");
  const [videosLang, setVideosLang] = useState<Language>("Hindi");

  const materials = useMemo<MaterialConfig[]>(
    () => [
      {
        title: "Handbook",
        description: "Download participant handbooks.",
        downloads: {
          Hindi: [{ label: "Handbook (Hindi) - Coming soon", href: null }],
          Marathi: [{ label: "Handbook (Marathi) - Coming soon", href: null }],
        },
      },
      {
        title: "Banner",
        description: "Download banners for session venue.",
        downloads: {
          Hindi: [{ label: "Banner (Hindi) - Coming soon", href: null }],

          Marathi: [{ label: "Banner (Marathi)", href: banner }],
        },
      },
      {
        title: "Script Files",
        description: "Download Script Files.",
        downloads: {
          Hindi: [
            {
              label: "Script on How to Guide about UPI - Part 1",
              href: script_1,
            },
            {
              label: "Script on How to Guide about UPI - Part 2",
              href: script_2,
            },
          ],

          Marathi: [
            { label: "Script File(Marathi) - Coming soon", href: banner },
          ],
        },
      },
      {
        title: "Videos",
        description: "RBI-approved awareness videos for sessions.",
        downloads: {
          Hindi: [
            {
              label: "Digital Payment Awareness Video (Hindi)",
              href: "https://youtu.be/ef9HRVlel6E",
            },
          ],
          Marathi: [
            {
              label: "डिजिटल पेमेंट जनजागृती व्हिडिओ (Marathi)",
              href: "https://youtu.be/ef9HRVlel6E",
            },
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
      <option value="Hindi">Hindi</option>
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

        <div className="mt-5 space-y-4">
          {items.map((d, idx) => {
            // VIDEO CARD (YouTube redirect)
            if (title === "Videos" && d.href) {
              return (
                <div
                  key={`${title}-${idx}`}
                  onClick={() => {
                    if (d.href) {
                      window.open(d.href, "_blank", "noopener,noreferrer");
                    }
                  }}
                  className="group cursor-pointer border rounded-2xl p-4 bg-gray-50 hover:bg-gray-100 transition"
                >
                  <div className="text-sm font-medium text-gray-800 mb-3">
                    {d.label}
                  </div>

                  <div className="relative w-full h-[220px] rounded-xl bg-linear-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                    <PlayCircle className="w-16 h-16 text-white opacity-90 group-hover:scale-110 transition-transform" />

                    <span className="absolute bottom-3 right-3 text-xs text-white/70">
                      Watch on YouTube
                    </span>
                  </div>
                </div>
              );
            }

            // DEFAULT DOWNLOAD (Handbook / Banner)
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
                  disabled={disabled}
                  onClick={() => {
                    if (!d.href) return;
                    downloadFile(d.href, d.label);
                  }}
                >
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
  const scriptItem = materials.find((m) => m.title === "Script Files")!
    .downloads[scriptLang];
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
          title="Script Files"
          description={
            materials.find((m) => m.title === "Script Files")!.description
          }
          lang={scriptLang}
          onLangChange={setscriptLang}
          items={scriptItem}
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

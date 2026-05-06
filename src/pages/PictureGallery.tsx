/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import Logo from "../components/Logo";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const galleryItems = [
  { size: 50, label: "Small Logo (50x50)" },
  { size: 100, label: "Medium Logo (100x100)" },
  { size: 150, label: "Large Logo (150x150)" },
  { size: 200, label: "X-Large Logo (200x200)" },
  { size: 120, label: "Nav Logo (120x120)" },
  { size: 80, label: "Favicon Size (80x80)" },
];

export default function PictureGallery() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-white"
    >
      {/* Header */}
      <div className="border-b border-black/5 bg-bg-main">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-slate-500 hover:text-charcoal transition-colors font-bold uppercase tracking-widest text-xs"
          >
            <ArrowLeft size={16} />
            Back to Home
          </button>
          <h1 className="text-charcoal font-black uppercase tracking-widest text-sm">
            Picture Gallery
          </h1>
        </div>
      </div>

      {/* Gallery Section */}
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-charcoal mb-4">
            Solid Solutions Logo
          </h2>
          <p className="text-slate-500 font-medium max-w-2xl mx-auto">
            The official logo of Solid Solutions displayed in various sizes for brand consistency across all platforms.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          {galleryItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-slate-50 border border-black/5 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 hover:shadow-xl transition-all group"
            >
              <div className="text-charcoal group-hover:scale-110 transition-transform duration-300">
                <Logo width={item.size} height={item.size} />
              </div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400 text-center">
                {item.label}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <p className="text-slate-500 font-medium mb-6">
            Need the logo for your project? Contact us at{" "}
            <a href="mailto:info@solidsolutions.africa" className="text-charcoal font-bold underline">
              info@solidsolutions.africa
            </a>
          </p>
          <button
            onClick={() => navigate("/#contact")}
            className="px-8 py-3 bg-charcoal text-white font-black uppercase tracking-widest text-xs rounded shadow-xl hover:shadow-black/20 transition-all"
          >
            Get in Touch
          </button>
        </div>
      </div>
    </motion.div>
  );
}

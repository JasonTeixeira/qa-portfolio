import type { Metadata } from 'next';
import { HOME_V2_HTML } from './home-v2-content';

export const metadata: Metadata = {
  title: 'Sage Academy',
};

/**
 * /home-v2 — faithful preview of the first-party Sage Academy "Home" design.
 *
 * The design's final rendered DOM (design-source/rendered/home.html) is
 * reproduced exactly. All inline styles are preserved; the design runtime
 * (support.js, image-slot.js, sage-widgets.js), the <x-dc>/<helmet> wrappers,
 * every <script> tag, the sage-* custom-element widgets, and all data-dc-*
 * attributes have been stripped. Because this is static, first-party content
 * with no interactivity beyond plain links, it is rendered verbatim via
 * dangerouslySetInnerHTML in a server component — the exactness-optimal path.
 *
 * Fonts (Fraunces, Hanken Grotesk, JetBrains Mono) are already loaded globally
 * by the app layout, so no font <link> tags are added here.
 */
export default function HomeV2Page() {
  return <div dangerouslySetInnerHTML={{ __html: HOME_V2_HTML }} />;
}

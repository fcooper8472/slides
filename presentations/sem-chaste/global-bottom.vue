<template>
  <span />
</template>

<!-- Global (unscoped) styles: these reach the theme's cover-layout markup,
     which per-slide <style> blocks in slides.md cannot. -->
<style>
.oxrse-cover-group {
  visibility: hidden;
  position: relative;
}
.oxrse-cover-group::after {
  content: 'Fergus Cooper';
  visibility: visible;
  position: absolute;
  left: 0;
  white-space: nowrap;
}
.oxrse-cover-email {
  display: none;
}

/* Add `class: spread` to a slide's frontmatter to vertically centre its
   content and open up bullet spacing, so bullet-only slides fill the page. */
.slidev-layout.spread {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.slidev-layout.spread :is(ul, ol) {
  font-size: 1.25rem;
}
.slidev-layout.spread li {
  margin-block: 0.45rem;
  line-height: 1.5;
}
.slidev-layout.spread p {
  font-size: 1.15rem;
}
</style>

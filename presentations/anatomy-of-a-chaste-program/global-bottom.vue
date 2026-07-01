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
</style>

<template>
  <div>
    <div :class="loadedStyle" :style="combinedStyle">
      <slot></slot>
    </div>
    <div v-if="processed">
      <slot></slot>
    </div>
  </div>
</template>

<script>
import { isServer, processReactNode } from "cloudimage-responsive-utils";

import { getFilteredBgProps } from "./utils.js";
export default {
  inject: ["cloudProvider"],
  props: {
    src: String,
    params: String,
    styles: Object
  },
  data() {
    return {
      server: isServer(),
      cloudimgURL: "",
      processed: false,
      loaded: false,
      data: "",
      properties: {
        src: this.src,
        params: this.params ? this.params : undefined,
        config: this.cloudProvider.config,
        style: this.styles
      },
      combinedStyle: "",
      container: "",
      className: "",
      lazyLoadConfig: "",
      otherProps: "",
      loadedStyle: ""
    };
  },
  mounted() {
    if (this.server) return;
    console.log(this.properties.style);
    this.combinedStyle = {
      ...this.properties.style,
      backgroundImage: `url(${this.data.cloudimgURL})`
    };
    const { className } = getFilteredBgProps(this.properties);
    this.className = className;

    this.processBg();
  },
  methods: {
    processBg(update, windowScreenBecomesBigger) {
      const bgNode = this.$el;
      const data = processReactNode(
        this.properties,
        bgNode,
        update,
        windowScreenBecomesBigger
      );

      if (!data) {
        return;
      }

      this.data = data;
    },
    preLoadImg(cloudimgURL) {
      const img = new Image();

      img.onload = this.onImgLoad;
      img.src = cloudimgURL;
    },

    onImgLoad() {
      this.loaded = true;
    }
  },
  watch: {
    "properties.config.innerWidth": function(newVal, oldVal) {
      const style = this.properties.style;
      const cloudimgURL = this.data.cloudimgURL;
      const previewCloudimgURL = this.data.previewCloudimgURL;
      const loaded = this.loaded;

      if (this.server) return;

      const {
        config: { innerWidth }
      } = this.properties;

      if (oldVal !== innerWidth) {
        this.processBg(true, innerWidth > oldVal);
      }
    },
    "properties.src": function(newVal, oldVal) {
      const { src } = this.properties;
      if (src !== oldVal.src) {
        this.processBg();
      }
    },
    loaded: function(newVal) {
      const loaded = newVal;
      if (loaded) {
        const loaded = this.loaded;
        this.combinedStyle = {
          ...this.properties.style,
          backgroundImage: `url(${this.data.cloudimgURL})`
        };
        this.loadedStyle = [this.className, "cloudimage-background", "loaded"]
          .join(" ")
          .trim();
      } else {
        this.loadedStyle = [this.className, "cloudimage-background", "loading"];
      }
    },

    "data.cloudimgURL": function(newVal) {
      const {
        config: { delay }
      } = this.cloudProvider;

      if (typeof delay !== "undefined") {
        setTimeout(() => {
          this.preLoadImg(newVal);
        }, delay);
      } else {
        this.preLoadImg(newVal);
      }
    }
  }
};
</script>

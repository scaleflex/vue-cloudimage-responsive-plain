<template>
  <div>
    <img
      v-bind:class="loadedStyle"
      v-bind:src="data.cloudimgURL"
      :srcset="cloudimgSRCSET"
      v-bind:alt="alt"
      @load="onImgLoad"
      v-bind="{ ...otherProps }"
    />
    <img v-if="server" :alt="alt" :src="BASE_64_PLACEHOLDER" />
  </div>
</template>

<script>
import { isServer, processReactNode } from "cloudimage-responsive-utils";
import { BASE_64_PLACEHOLDER } from "cloudimage-responsive-utils/dist/constants";
import { getFilteredProps } from "./utils";

export default {
  inject: ["cloudProvider"],
  props: {
    src: String,
    ratio: Number,
    sizes: Object,
    params: String
  },
  data() {
    return {
      server: isServer(),
      BASE_64_PLACEHOLDER,
      cloudimgURL: "",
      processed: false,
      loaded: false,
      loadedImageWidth: "",
      loadedImageHeight: "",
      loadedImageRatio: "",
      data: "",
      properties: {
        src: this.src,
        ratio: this.ratio,
        sizes: this.sizes || {},
        blurhash: this.blurhash,
        params: this.params,
        config: this.cloudProvider.config
      },
      alt: "",
      className: "",
      lazyLoadConfig: "",
      preserveSize: "",
      imgNodeWidth: "",
      imgNodeHeight: "",
      otherProps: "",
      cloudimgSRCSET: "",

      loadedStyle: "",
      height: { height: 0 }
    };
  },
  mounted() {
    console.log("onMount props", this.properties);
    console.log("onMount state", this);
    const {
      alt,
      className,
      lazyLoadConfig,
      preserveSize,
      imgNodeWidth,
      imgNodeHeight,
      ...otherProps
    } = getFilteredProps(this.properties);

    if (this.server) return;
    const {
      config: { delay }
    } = this.cloudProvider;

    if (typeof delay !== "undefined") {
      setTimeout(() => {
        this.processImg();
      }, delay);
    } else {
      this.processImg();
    }

    this.alt = alt;
    this.className = className;
    this.lazyLoadConfig = lazyLoadConfig;
    this.preserveSize = preserveSize;
    this.imgNodeWidth = imgNodeWidth;
    this.imgNodeHeight = imgNodeHeight;
    this.otherProps = { ...otherProps };
  },
  updated() {
    if (this.data.cloudimgSRCSET) {
      const cloudimgSRCSET = this.data.cloudimgSRCSET
        .map(({ dpr, url }) => `${url} ${dpr}x`)
        .join(", ");
      this.cloudimgSRCSET = cloudimgSRCSET;
    }
  },
  methods: {
    processImg(update, windowScreenBecomesBigger) {
      const imgNode = this.$el;

      const data = processReactNode(
        this.properties,
        imgNode,
        update,
        windowScreenBecomesBigger,
        false
      );

      this.data = data;
    },

    onPreviewLoaded(event) {
      if (this.previewLoaded) return;

      this.updateLoadedImageSize(event.target);
      this.previewLoaded = true;
    },
    updateLoadedImageSize(image) {
      this.loadedImageWidth = image.naturalWidth;
      this.loadedImageHeight = image.naturalHeight;
      this.loadedImageRatio = image.naturalWidth / image.naturalHeight;
    },

    onImgLoad(event) {
      this.updateLoadedImageSize(event.target);
      this.loaded = true;
    }
  },
  watch: {
    "properties.config.innerWidth": function(newVal, oldVal) {
      if (this.server) return;

      const { preserveSize, imgNodeWidth, imgNodeHeight } = getFilteredProps(
        this.properties
      );

      const {
        config: { innerWidth }
      } = this.properties;

      if (oldVal !== innerWidth) {
        this.processImg(true, innerWidth > oldVal);
      }
    },
    "properties.src": function(newVal, oldVal) {
      const { src } = this.properties;
      if (src !== oldVal.src) {
        this.processImg();
      }
    },
    loaded: function(newVal) {
      console.log("onMount props", this.properties);
      console.log("onMount state", this);

      const loaded = newVal;
      const { preserveSize, imgNodeWidth, imgNodeHeight } = getFilteredProps(
        this.properties
      );

      if (loaded) {
        this.loadedStyle = [this.className, "cloudimage-background", "loaded"]
          .join(" ")
          .trim();
      } else {
        this.loadedStyle = [this.className, "cloudimage-background", "loading"]
          .join(" ")
          .trim();
      }
    },
    "data.height": function(newVal) {
      this.height = { height: newVal };
    }
  }
};
</script>

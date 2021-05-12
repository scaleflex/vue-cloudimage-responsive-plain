<template>
  <img v-if="server" :alt="alt" :src="BASE_64_PLACEHOLDER" />
  <lazy-component
    v-else-if="!server && properties.config.lazyLoading && lazyLoadActive"
    @show="handler"
  >
  <img
    v-bind:class="loadedStyle"
    v-bind:alt="alt"
    @load="_onImgLoad"
    v-bind="{ ...otherProps }"
    :width="getWidth(width)"
    :height="getHeight(height)"
  />
  </lazy-component>
  <img
    v-else
    v-bind:class="loadedStyle"
    v-bind:src="data.cloudimgURL"
    :srcset="cloudimgSRCSET"
    v-bind:alt="alt"
    :width="getWidth(width)"
    :height="getHeight(height)"
    @load="_onImgLoad"
  />
</template>

<script>
import { isServer, processReactNode} from "cloudimage-responsive-utils";
import { BASE_64_PLACEHOLDER } from "cloudimage-responsive-utils/dist/constants";

export default {
  // geting the data from the provider
  inject: ["cloudProvider"],
  props: {
    src: String,
    width: String,
    height: String,
    params: String,
    sizes: Object,
    ratio: Number,
    lazyLoading: Boolean,
    lazyLoadConfig: Object,
    alt: String,
    className: String,
    onImgLoad: Function,
  },
  data() {
    return {
      server: isServer(),
      BASE_64_PLACEHOLDER,
      lazyLoadActive: true,
      cloudimgURL: "",
      processed: false,
      loaded: false,
      loadedImageWidth: "",
      loadedImageHeight: "",
      loadedImageRatio: "",
      data: "",
      properties: {
        src: this.src,
        width: this.width,
        height: this.height,
        params: this.params,
        sizes: this.sizes,
        ratio: this.ratio,
        lazyLoading: this.lazyLoading,
        lazyLoadConfig: this.lazyLoadConfig,
        alt: this.alt,
        className: this.className,
        config: this.cloudProvider.config,
        onImgLoad: this.onImgLoad,
      },
      preserveSize: "",
      imgNodeWidth: "",
      imgNodeHeight: "",
      otherProps: "",
      cloudimgSRCSET: "",
      loadedStyle: "",
    };
  },
  mounted() {
    if (this.server) return;

    //initial loading style
    this.loadedStyle = [this.className, "cloudimage-background", "loading"]
      .join(" ")
      .trim();

    this.processImg();
  },
  updated() {
    //srcset value after processing image
    if (this.data.cloudimgSRCSET) {
      const cloudimgSRCSET = this.data.cloudimgSRCSET
        .map(({ dpr, url }) => `${url} ${dpr}x`)
        .join(", ");
      this.cloudimgSRCSET = cloudimgSRCSET;
    }
  },
  methods: {
    handler(component) {
      setTimeout(() => {
        this.lazyLoadActive = false;
      }, 100);
    },
    processImg(update, windowScreenBecomesBigger) {
      const imgNode = this.$el;

      const data = processReactNode(
        this.properties,
        imgNode,
        update,
        windowScreenBecomesBigger,
        false
      );
      //if size is defined so data is defined if not error well appear
      if (data) {
        this.data = data;
      }
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

    _onImgLoad(event) {
      this.updateLoadedImageSize(event.target);
      this.loaded = true;

      const { onImgLoad } = this.properties;
      if (typeof onImgLoad === "function") {
        onImgLoad(event);
      }
    },

    getWidth(width){
      return width ? parseInt(width, 10) : null;
    },
     
    getHeight(height){
      return height ? parseInt(height, 10) : null;
    }
  },
  watch: {
    "properties.config.innerWidth": function (newVal, oldVal) {
      if (this.server) return;

      const {
        config: { innerWidth },
      } = this.properties;

      if (oldVal !== innerWidth) {
        //if width changed update the data from proccesing image

        this.processImg(true, innerWidth > oldVal);
      }
    },
    "properties.src": function (newVal, oldVal) {
      const { src } = this.properties;
      if (src !== oldVal.src) {
        this.processImg();
      }
    },
    loaded: function (newVal) {
      const loaded = newVal;

      if (loaded === true) {
        //if  loaded change to loaded
        this.loadedStyle = [this.className, "cloudimage-background", "loaded"]
          .join(" ")
          .trim();
      } else {
        //if still loading change to loading
        this.loadedStyle = [this.className, "cloudimage-background", "loading"]
          .join(" ")
          .trim();
      }
    },
  },
};
</script>

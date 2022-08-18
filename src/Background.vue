<template>
  <div v-if="processed">
    <slot></slot>
  </div>
  <lazy-component
    v-else-if="properties.config.lazyLoading && lazyLoadActive"
    @show="handler"
  >
    <div :class="loadedStyle" :style="combinedStyle">
      <slot></slot>
    </div>
  </lazy-component>
  <div v-else :class="loadedStyle" :style="combinedStyle">
    <slot></slot>
  </div>
</template>

<script>
import { isServer, processReactNode } from "cloudimage-responsive-utils";

export default {
  // geting the data from the provider
  inject: ["cloudProvider"],
  props: {
    src: String,
    params: String,
    styles: Object,
    width: String,
    height: String,
    sizes: Object,
    ratio: Number,
    lazyLoading: Boolean,
    lazyLoadConfig: Object,
    alt: String,
    className: String,
    onImgLoad: Function,
    doNotReplaceURL: Boolean,
  },
  data() {
    return {
      server: isServer(),
      lazyLoadActive: true,
      cloudimgURL: "",
      processed: false,
      loaded: false,
      data: "",
      properties: {
        src: this.src,
        params: this.params ? this.params : undefined,
        config: this.cloudProvider.config,
        style: this.styles,
        width: this.width,
        height: this.height,
        sizes: this.sizes,
        ratio: this.ratio,
        lazyLoading: this.lazyLoading,
        lazyLoadConfig: this.lazyLoadConfig,
        alt: this.alt,
        className: this.className,
        onImgLoad: this.onImgLoad,
        doNotReplaceURL: this.doNotReplaceURL
      },
      combinedStyle: "",
      container: "",
      loadedStyle: "",
    };
  },
  mounted() {
    if (this.server) return;

    //initial loading style
    this.loadedStyle = [this.className, "cloudimage-background", "loading"];
    //initial value combinedstyle
    this.combinedStyle = {
      ...this.properties.style,
      backgroundImage: `url(${this.data.cloudimgURL})`,
    };

    this.processBg();
  },
  methods: {
    handler(component) {
      this.lazyLoadActive = false;

      //initial value combinedstyle
      this.combinedStyle = {
        ...this.properties.style,
        backgroundImage: `url(${this.data.cloudimgURL})`,
      };
    },
    processBg(update, windowScreenBecomesBigger) {
      const bgNode = this.$el;
      const data = processReactNode(
        this.properties,
        bgNode,
        update,
        windowScreenBecomesBigger
      );

      if (data) {
        this.data = data;
      }
    },
    preLoadImg(cloudimgURL) {
      const img = new Image();

      const { onImgLoad } = this.properties;

      img.onload = function() {
        onImgLoad();
      };
      img.src = cloudimgURL;
    },

    _onImgLoad(event) {
      this.loaded = true;
      const { onImgLoad } = this.properties;
      if (typeof onImgLoad === "function") {
        onImgLoad(event);
      }
    },
  },
  watch: {
    "properties.config.innerWidth": function (newVal, oldVal) {
      const style = this.properties.style;
      const cloudimgURL = this.data.cloudimgURL;
      const previewCloudimgURL = this.data.previewCloudimgURL;
      const loaded = this.loaded;

      if (this.server) return;

      const {
        config: { innerWidth },
      } = this.properties;

      if (oldVal !== innerWidth) {
        //if width changed update the data from proccesing background image
        this.processBg(true, innerWidth > oldVal);
      }

      //update value combinedstyle when width changed
      this.combinedStyle = {
        ...this.properties.style,
        backgroundImage: `url(${this.data.cloudimgURL})`,
      };
    },
    "properties.src": function (newVal, oldVal) {
      const { src } = this.properties;
      if (src !== oldVal.src) {
        this.processBg();
      }
    },
    loaded: function (newVal) {
      const loaded = newVal;

      if (loaded) {
        const loaded = this.loaded;
        //updating value of combined style if page loaded
        this.combinedStyle = {
          ...this.properties.style,
          backgroundImage: `url(${this.data.cloudimgURL})`,
        };
        //if loaded change style to loaded
        this.loadedStyle = [this.className, "cloudimage-background", "loaded"]
          .join(" ")
          .trim();
      } else {
        //if still loading change to loading
        this.loadedStyle = [this.className, "cloudimage-background", "loading"];
      }
    },

    lazyLoadActive: function () {
      if (!this.lazyLoadActive) {
        const {
          config: { delay },
        } = this.cloudProvider;

        if (typeof delay !== "undefined") {
          setTimeout(() => {
            this.preLoadImg(this.data.cloudimgURL);
          }, delay);
        } else {
          this.preLoadImg(this.data.cloudimgURL);
        }
      }
    },
  },
};
</script>

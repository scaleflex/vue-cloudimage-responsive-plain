<template>
  <div>
    <img
      v-if="properties.config.lazyLoading"
      v-lazy="data.cloudimgURL"
      v-bind:class="loadedStyle"
      v-bind:src="data.cloudimgURL"
      :srcset="cloudimgSRCSET"
      v-bind:alt="alt"
      @load="onImgLoad"
      v-bind="{ ...otherProps }"
    />
    <img
      v-else
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
import { isServer, processReactNode } from 'cloudimage-responsive-utils';
import { BASE_64_PLACEHOLDER } from 'cloudimage-responsive-utils/dist/constants';
import { getFilteredProps } from './utils';

export default {
  // geting the data from the provider
  inject: ['cloudProvider'],
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
      cloudimgURL: '',
      processed: false,
      loaded: false,
      loadedImageWidth: '',
      loadedImageHeight: '',
      loadedImageRatio: '',
      data: '',
      properties: {
        src: this.src,
        ratio: this.ratio,
        sizes: this.sizes || {},
        blurhash: this.blurhash,
        params: this.params,
        config: this.cloudProvider.config
      },
      alt: '',
      className: '',
      lazyLoadConfig: '',
      preserveSize: '',
      imgNodeWidth: '',
      imgNodeHeight: '',
      otherProps: '',
      cloudimgSRCSET: '',

      loadedStyle: '',
      height: { height: 0 }
    };
  },
  mounted() {
    if (this.server) return;

    const {
      alt,
      className,
      lazyLoadConfig,
      preserveSize,
      imgNodeWidth,
      imgNodeHeight,
      ...otherProps
    } = getFilteredProps(this.properties);

    //initial loading style
    this.loadedStyle = [this.className, 'cloudimage-background', 'loading']
      .join(' ')
      .trim();

    const {
      config: { delay }
    } = this.cloudProvider;

    if (typeof delay !== 'undefined') {
      setTimeout(() => {
        this.processImg();
      }, delay);
    } else {
      this.processImg();
    }

    //the value from filter and passing to data
    this.alt = alt;
    this.className = className;
    this.lazyLoadConfig = lazyLoadConfig;
    this.preserveSize = preserveSize;
    this.imgNodeWidth = imgNodeWidth;
    this.imgNodeHeight = imgNodeHeight;
    this.otherProps = { ...otherProps };
  },
  updated() {
    //srcset value after processing image
    if (this.data.cloudimgSRCSET) {
      const cloudimgSRCSET = this.data.cloudimgSRCSET
        .map(({ dpr, url }) => `${url} ${dpr}x`)
        .join(', ');
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
    'properties.config.innerWidth': function(newVal, oldVal) {
      if (this.server) return;

      const { preserveSize, imgNodeWidth, imgNodeHeight } = getFilteredProps(
        this.properties
      );

      const {
        config: { innerWidth }
      } = this.properties;

      if (oldVal !== innerWidth) {
        //if width changed update the data from proccesing image
        this.processImg(true, innerWidth > oldVal);
      }
    },
    'properties.src': function(newVal, oldVal) {
      const { src } = this.properties;
      if (src !== oldVal.src) {
        this.processImg();
      }
    },
    loaded: function(newVal) {
      const loaded = newVal;
      const { preserveSize, imgNodeWidth, imgNodeHeight } = getFilteredProps(
        this.properties
      );

      if (loaded) {
        //if  loaded change to loaded
        this.loadedStyle = [this.className, 'cloudimage-background', 'loaded']
          .join(' ')
          .trim();
      } else {
        //if still loading change to loading
        this.loadedStyle = [this.className, 'cloudimage-background', 'loading']
          .join(' ')
          .trim();
      }
    }
  }
};
</script>

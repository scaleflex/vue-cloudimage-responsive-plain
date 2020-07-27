<template>
  <div>
    <!-- <lazy-compnent
      v-if="properties.config.lazyLoading && lazyLoadActive"
      @show="handler"
    >
      <div :class="loadedStyle" :style="combinedStyle">
        <slot></slot>
      </div>
    </lazy-compnent> -->
    <div
      :class="loadedStyle"
      v-lazy:background-image="this.data.cloudimgURL"
      :style="combinedStyle"
    >
      <slot></slot>
    </div>
    <div v-if="processed">
      <slot></slot>
    </div>
  </div>
</template>

<script>
import { isServer, processReactNode } from 'cloudimage-responsive-utils';
import { getFilteredBgProps } from './utils.js';
export default {
  // geting the data from the provider
  inject: ['cloudProvider'],
  props: {
    src: String,
    params: String,
    styles: Object
  },
  data() {
    return {
      server: isServer(),
      lazyLoadActive: '',
      cloudimgURL: '',
      processed: false,
      loaded: false,
      data: '',
      properties: {
        src: this.src,
        params: this.params ? this.params : undefined,
        config: this.cloudProvider.config,
        style: this.styles
      },
      combinedStyle: '',
      container: '',
      className: '',
      lazyLoadConfig: '',
      otherProps: '',
      loadedStyle: ''
    };
  },
  mounted() {
    if (this.server) return;

    //initial loading style
    this.loadedStyle = [this.className, 'cloudimage-background', 'loading'];
    //initial value combinedstyle
    this.combinedStyle = {
      ...this.properties.style,
      backgroundImage: `url(${this.data.cloudimgURL})`
    };

    this.processBg();
  },
  methods: {
    handler(component) {
      this.lazyLoadActive = false;
    },
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
    'properties.config.innerWidth': function(newVal, oldVal) {
      const style = this.properties.style;
      const cloudimgURL = this.data.cloudimgURL;
      const previewCloudimgURL = this.data.previewCloudimgURL;
      const loaded = this.loaded;

      if (this.server) return;

      const {
        config: { innerWidth }
      } = this.properties;

      if (oldVal !== innerWidth) {
        //if width changed update the data from proccesing background image
        this.processBg(true, innerWidth > oldVal);
      }

      //update value combinedstyle when width changed
      this.combinedStyle = {
        ...this.properties.style,
        backgroundImage: `url(${this.data.cloudimgURL})`
      };
    },
    'properties.src': function(newVal, oldVal) {
      const { src } = this.properties;
      if (src !== oldVal.src) {
        this.processBg();
      }
    },
    loaded: function(newVal) {
      const loaded = newVal;
      if (loaded) {
        const loaded = this.loaded;
        //updating value of combined style if page loaded
        this.combinedStyle = {
          ...this.properties.style,
          backgroundImage: `url(${this.data.cloudimgURL})`
        };
        //if loaded change style to loaded
        this.loadedStyle = [this.className, 'cloudimage-background', 'loaded']
          .join(' ')
          .trim();
      } else {
        //if still loading change to loading
        this.loadedStyle = [this.className, 'cloudimage-background', 'loading'];
      }
    },

    'data.cloudimgURL': function(newVal) {
      const {
        config: { delay }
      } = this.cloudProvider;

      if (typeof delay !== 'undefined') {
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

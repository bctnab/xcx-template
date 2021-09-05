Component({
  externalClasses: ['hover-class', 'custom-class'],
  data: {},
  properties: {
    dataset: null,
  },
  lifetimes: {},
  methods: {
    onClick: function () {
      console.log('click');
    },
  },
});

export const getFilteredProps = props => {
  const { config = {}, alt = '', className = '', src, sizes, width, height, ratio, params, ...otherProps } = props;

  return {
    alt,
    className,
    imgNodeWidth: width,
    imgNodeHeight: height,
    ...otherProps
  }
};

export const getFilteredBgProps = props => {
  const { config = {}, alt = '', className = '', src, sizes, width, height, ratio, params, ...otherProps } = props;

  return {
    config,
    className,
    ...otherProps
  };
};
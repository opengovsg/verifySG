export const ProductionUrl = '/'
export const StagingBannerMessage = () => (
  <span>
    You are currently on the staging version of CheckWho, which can only send
    Singpass notifications to specially provisioned staging accounts. Please
    find the production version <a href={ProductionUrl}>here</a>.
  </span>
)

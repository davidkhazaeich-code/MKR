/**
 * Icon — wrapper centralisé @remixicon/react.
 *
 * Pourquoi ce wrapper :
 * - API unique <Icon name="..." size={...} /> au lieu d'importer chaque
 *   <RiXxxLine /> séparément (lisibilité + cohérence).
 * - Tree-shaking préservé : les icônes sont importées nominalement depuis
 *   @remixicon/react, donc Next bundle uniquement celles utilisées.
 * - Conventions MKR : taille par défaut 24, currentColor, focusable=false.
 * - Pour ajouter une icône : 1) imports ci-dessous, 2) entrée dans MAP,
 *   3) ajouter le name au type IconName.
 *
 * Catalogue Remix : https://remixicon.com/
 */
import type { ComponentType } from 'react'
import {
  RiCheckLine,
  RiCloseLine,
  RiArrowLeftLine,
  RiArrowRightLine,
  RiArrowDownSLine,
  RiArrowUpSLine,
  RiArrowRightSLine,
  RiArrowLeftSLine,
  RiSearchLine,
  RiPhoneLine,
  RiMailLine,
  RiWhatsappLine,
  RiInstagramLine,
  RiFacebookCircleLine,
  RiYoutubeLine,
  RiLogoutBoxLine,
  RiInboxLine,
  RiErrorWarningLine,
  RiTimeLine,
  RiCheckboxCircleLine,
  RiCheckboxCircleFill,
  RiRefreshLine,
  RiPauseLine,
  RiSparklingLine,
  RiHistoryLine,
  RiEditLine,
  RiCalendarLine,
  RiCalendarEventLine,
  RiDeleteBinLine,
  RiFireLine,
  RiFlashlightLine,
  RiMoneyEuroCircleLine,
  RiPassportLine,
  RiPlaneLine,
  RiHotelLine,
  RiHomeLine,
  RiHome4Line,
  RiTeamLine,
  RiUserLine,
  RiUserStarLine,
  RiParentLine,
  RiRestaurant2Line,
  RiHotelBedLine,
  RiShieldCheckLine,
  RiShieldLine,
  RiStarFill,
  RiStarLine,
  RiPlayCircleFill,
  RiPlayCircleLine,
  RiFileCopyLine,
  RiInformationLine,
  RiSendPlaneLine,
  RiMapPinLine,
  RiMapPin2Line,
  RiLandscapeLine,
  RiBoxingLine,
  RiTrophyLine,
  RiQuestionLine,
  RiBookOpenLine,
  RiBus2Line,
  RiTaxiLine,
  RiSettings3Line,
  RiUploadCloud2Line,
  RiDownloadCloud2Line,
  RiDownloadLine,
  RiExternalLinkLine,
  RiGlobeLine,
  RiTranslate2,
  RiEyeLine,
  RiEyeOffLine,
  RiHeartLine,
  RiHeart3Line,
  RiThumbUpLine,
  RiBriefcaseLine,
  RiGraduationCapLine,
  RiCustomerService2Line,
  RiBuilding2Line,
  RiCommunityLine,
  RiSwordLine,
  RiCameraLine,
  RiImageLine,
  RiFilter3Line,
  RiMenuLine,
  RiAddLine,
  RiSubtractLine,
  RiLoader4Line,
  RiNotification3Line,
  RiAlarmWarningLine,
  RiBriefcase4Line,
  RiCake2Line,
  RiFlag2Line,
  RiCarLine,
  RiMessage2Line,
  RiChat3Line,
  RiQuoteText,
  RiLineChartLine,
  RiPriceTag3Line,
} from '@remixicon/react'

export type IconName =
  // navigation / actions
  | 'check' | 'x' | 'menu' | 'plus' | 'minus' | 'spinner'
  | 'arrow-left' | 'arrow-right'
  | 'chevron-down' | 'chevron-up' | 'chevron-right' | 'chevron-left'
  | 'search' | 'filter' | 'edit' | 'copy' | 'trash' | 'settings'
  | 'upload' | 'download' | 'cloud-download' | 'external-link'
  | 'eye' | 'eye-off' | 'send'
  // contact / social
  | 'phone' | 'mail' | 'whatsapp' | 'instagram' | 'facebook' | 'youtube'
  // status / feedback
  | 'log-out' | 'inbox' | 'alert' | 'alert-warn'
  | 'clock' | 'euro' | 'check-circle' | 'check-circle-fill'
  | 'rotate-ccw' | 'pause' | 'sparkles' | 'history'
  | 'fire' | 'zap' | 'info' | 'notification'
  // calendar
  | 'calendar' | 'calendar-event' | 'cake'
  // travel / logistics MKR
  | 'passport' | 'plane' | 'hotel' | 'bed' | 'food' | 'taxi' | 'bus' | 'car'
  | 'map-pin' | 'map-pin-2' | 'mountain' | 'globe' | 'translate' | 'flag'
  // people / family
  | 'user' | 'user-star' | 'team' | 'parent' | 'community'
  // safety / quality
  | 'shield' | 'shield-check' | 'star' | 'star-fill'
  | 'play' | 'play-line' | 'trophy' | 'heart' | 'heart-3' | 'thumb-up'
  // sport / training
  | 'boxing' | 'sword' | 'briefcase' | 'graduation' | 'support'
  // content
  | 'question' | 'book-open' | 'camera' | 'image'
  | 'message' | 'chat' | 'quote'
  | 'home' | 'home-4' | 'building'
  | 'chart' | 'tag'

// Les composants Remix Icon ont leur propre type interne (RemixiconComponentType)
// non exporté du package. On les stocke comme ComponentType<any> et on passe
// nos props via spread typé côté <Icon /> ci-dessous.
const MAP: Record<IconName, ComponentType<any>> = {
  // navigation / actions
  check: RiCheckLine,
  x: RiCloseLine,
  menu: RiMenuLine,
  plus: RiAddLine,
  minus: RiSubtractLine,
  spinner: RiLoader4Line,
  'arrow-left': RiArrowLeftLine,
  'arrow-right': RiArrowRightLine,
  'chevron-down': RiArrowDownSLine,
  'chevron-up': RiArrowUpSLine,
  'chevron-right': RiArrowRightSLine,
  'chevron-left': RiArrowLeftSLine,
  search: RiSearchLine,
  filter: RiFilter3Line,
  edit: RiEditLine,
  copy: RiFileCopyLine,
  trash: RiDeleteBinLine,
  settings: RiSettings3Line,
  upload: RiUploadCloud2Line,
  download: RiDownloadLine,
  'cloud-download': RiDownloadCloud2Line,
  'external-link': RiExternalLinkLine,
  eye: RiEyeLine,
  'eye-off': RiEyeOffLine,
  send: RiSendPlaneLine,
  // contact / social
  phone: RiPhoneLine,
  mail: RiMailLine,
  whatsapp: RiWhatsappLine,
  instagram: RiInstagramLine,
  facebook: RiFacebookCircleLine,
  youtube: RiYoutubeLine,
  // status / feedback
  'log-out': RiLogoutBoxLine,
  inbox: RiInboxLine,
  alert: RiErrorWarningLine,
  'alert-warn': RiAlarmWarningLine,
  clock: RiTimeLine,
  euro: RiMoneyEuroCircleLine,
  'check-circle': RiCheckboxCircleLine,
  'check-circle-fill': RiCheckboxCircleFill,
  'rotate-ccw': RiRefreshLine,
  pause: RiPauseLine,
  sparkles: RiSparklingLine,
  history: RiHistoryLine,
  fire: RiFireLine,
  zap: RiFlashlightLine,
  info: RiInformationLine,
  notification: RiNotification3Line,
  // calendar
  calendar: RiCalendarLine,
  'calendar-event': RiCalendarEventLine,
  cake: RiCake2Line,
  // travel / logistics MKR
  passport: RiPassportLine,
  plane: RiPlaneLine,
  hotel: RiHotelLine,
  bed: RiHotelBedLine,
  food: RiRestaurant2Line,
  taxi: RiTaxiLine,
  bus: RiBus2Line,
  car: RiCarLine,
  'map-pin': RiMapPinLine,
  'map-pin-2': RiMapPin2Line,
  mountain: RiLandscapeLine,
  globe: RiGlobeLine,
  translate: RiTranslate2,
  flag: RiFlag2Line,
  // people / family
  user: RiUserLine,
  'user-star': RiUserStarLine,
  team: RiTeamLine,
  parent: RiParentLine,
  community: RiCommunityLine,
  // safety / quality
  shield: RiShieldLine,
  'shield-check': RiShieldCheckLine,
  star: RiStarLine,
  'star-fill': RiStarFill,
  play: RiPlayCircleFill,
  'play-line': RiPlayCircleLine,
  trophy: RiTrophyLine,
  heart: RiHeartLine,
  'heart-3': RiHeart3Line,
  'thumb-up': RiThumbUpLine,
  // sport / training
  boxing: RiBoxingLine,
  sword: RiSwordLine,
  briefcase: RiBriefcaseLine,
  graduation: RiGraduationCapLine,
  support: RiCustomerService2Line,
  // content
  question: RiQuestionLine,
  'book-open': RiBookOpenLine,
  camera: RiCameraLine,
  image: RiImageLine,
  message: RiMessage2Line,
  chat: RiChat3Line,
  quote: RiQuoteText,
  home: RiHomeLine,
  'home-4': RiHome4Line,
  building: RiBuilding2Line,
  chart: RiLineChartLine,
  tag: RiPriceTag3Line,
}

type IconProps = {
  name: IconName
  size?: number
  className?: string
  color?: string
  'aria-label'?: string
}

export default function Icon({ name, size = 24, className, color, ...aria }: IconProps) {
  const Cmp = MAP[name]
  return (
    <Cmp
      size={size}
      className={className}
      color={color ?? 'currentColor'}
      aria-hidden={aria['aria-label'] ? undefined : true}
      aria-label={aria['aria-label']}
    />
  )
}

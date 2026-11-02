// 专线线路页数据 —— 全部基于 company.ts 的真实网点与服务事实，禁止虚构覆盖城市
import { BRANCHES, COMPANY } from './company';

const branchOf = (city: string) => BRANCHES.find((b) => b.city === city)!;

const toBranchVO = (city: string) => {
  const b = branchOf(city);
  return { name: `新大物流（${b.city}营业点）`, address: b.address, phone: b.phone };
};

export interface LineFaq {
  q: string;
  a: string;
}

export interface LineInfo {
  slug: string;
  title: string;
  origin: string;
  dest: string;
  areaServed: string[];
  seoDesc: string;
  conclusion: string[];
  facts: { label: string; value: string }[];
  fromBranches: { name: string; address: string; phone: string }[];
  toBranches: { name: string; address: string; phone: string }[];
  services: { title: string; desc: string; points: string[] }[];
  faqs: LineFaq[];
}

// 各线路通用的标准 FAQ（答案自包含、带主语"新大物流"，便于 AI 独立引用）
const stdFaqs = (origin: string, dest: string): LineFaq[] => [
  {
    q: `${origin}到${dest}物流专线多久到？`,
    a: `新大物流${origin}到${dest}专线当天装车发车、次日到达，点对点直达中途不中转。${origin}侧接到委托后1小时内安排上门取货，货物当天上站当天发运。`,
  },
  {
    q: `${origin}到${dest}物流运费怎么计算？`,
    a: `运费按货物类型计算：整车运输按车型和趟次计费，零担货物按重量或体积计费，具体价格与货物体积、重量、包装要求有关。拨打新大物流询价热线${COMPANY.hotline}，报出货物信息即可获取当日报价。`,
  },
  {
    q: `${origin}发货到${dest}可以上门取货吗？`,
    a: `可以。新大物流提供接到委托后1小时内上门取货服务，${origin}设有直营网点，无需客户自行送货到场。`,
  },
  {
    q: `货物保险和破损理赔怎么办理？`,
    a: `新大物流全部货物由中国太平洋财产保险承保，可按货值预约足额保险，运输中出现破损按保险额度理赔，建议贵重货物发货前购买保险并到货先验货再签收。`,
  },
  {
    q: `支持代收货款吗？怎么结算？`,
    a: `支持。新大物流提供现结、到付、月结多种结算方式，并可代收货款、异地结算，货到通知收货人确认后按约定周期回款。`,
  },
];

export const LINES: LineInfo[] = [
  {
    slug: 'ganzhou-guangzhou',
    title: '赣州到广州物流专线',
    origin: '赣州',
    dest: '广州',
    areaServed: ['赣州', '南康', '广州'],
    seoDesc: `新大物流赣州到广州物流专线，当天发货次日到达，点对点直达不中转，赣州1小时内上门取货，广州网点送货上门，太平洋保险承保，支持代收货款。询价：${COMPANY.hotline}`,
    conclusion: [
      '时效：当天发货，次日到达广州',
      '发车：赣州↔广州往返天天发车，点对点直达不中转',
      '取货：赣州、南康两地网点1小时内上门提货',
    ],
    facts: [
      { label: '运输时效', value: '当天发货，次日到达' },
      { label: '发车频次', value: '天天发车（往返班线）' },
      { label: '上门取货', value: '接到委托1小时内上门' },
      { label: '货物保险', value: '中国太平洋财产保险承保' },
      { label: '询价热线', value: COMPANY.hotline },
    ],
    fromBranches: [
      { name: '新大物流（赣州总部）', address: COMPANY.headquarters, phone: COMPANY.hotline },
      toBranchVO('赣州五龙'),
      toBranchVO('赣州建材'),
    ],
    toBranches: [toBranchVO('广州')],
    services: [
      {
        title: '整车运输',
        desc: '赣州↔广州往返整车，天天发车准时准点',
        points: ['自有8部大型货车、合约车辆百余部', '当天装车当天发运', '点对点直达，中途不中转', '可预约保险，全程无忧'],
      },
      {
        title: '零担配送',
        desc: '小批量货物按需配载，灵活经济',
        points: ['1小时内上门取货', '轻拿轻放、稳固码放', '到货电话通知，准时派送上门', '代收货款，异地结算'],
      },
      {
        title: '仓储中转',
        desc: '5600㎡+仓库，24小时仓储中转',
        points: ['企业、工厂、商场货物全天候托管', '中转配送一站式完成'],
      },
    ],
    faqs: stdFaqs('赣州', '广州'),
  },
  {
    slug: 'ganzhou-foshan',
    title: '赣州到佛山物流专线',
    origin: '赣州',
    dest: '佛山',
    areaServed: ['赣州', '南康', '佛山'],
    seoDesc: `新大物流赣州到佛山物流专线，当天发货次日到达，佛山禅城直营网点提货派送，覆盖南庄易运物流市场，太平洋保险承保，支持代收货款。询价：${COMPANY.hotline}`,
    conclusion: [
      '时效：当天发货，次日到达佛山',
      '发车：赣州↔佛山往返天天发车，点对点直达不中转',
      '到达：佛山禅城区南庄镇易运物流市场直营网点提货派送',
    ],
    facts: [
      { label: '运输时效', value: '当天发货，次日到达' },
      { label: '发车频次', value: '天天发车（往返班线）' },
      { label: '上门取货', value: '接到委托1小时内上门' },
      { label: '货物保险', value: '中国太平洋财产保险承保' },
      { label: '询价热线', value: COMPANY.hotline },
    ],
    fromBranches: [
      { name: '新大物流（赣州总部）', address: COMPANY.headquarters, phone: COMPANY.hotline },
      toBranchVO('赣州五龙'),
      toBranchVO('赣州建材'),
    ],
    toBranches: [toBranchVO('佛山')],
    services: [
      {
        title: '整车运输',
        desc: '赣州↔佛山往返整车，天天发车准时准点',
        points: ['自有8部大型货车、合约车辆百余部', '当天装车当天发运', '点对点直达，中途不中转'],
      },
      {
        title: '零担配送',
        desc: '小批量货物按需配载，灵活经济',
        points: ['1小时内上门取货', '轻拿轻放、稳固码放', '到货电话通知，准时派送上门', '代收货款，异地结算'],
      },
      {
        title: '仓储中转',
        desc: '5600㎡+仓库，24小时仓储中转',
        points: ['企业、工厂、商场货物全天候托管', '中转配送一站式完成'],
      },
    ],
    faqs: stdFaqs('赣州', '佛山'),
  },
  {
    slug: 'ganzhou-zhongshan-shunde',
    title: '赣州到中山顺德物流专线',
    origin: '赣州',
    dest: '中山、顺德',
    areaServed: ['赣州', '南康', '中山', '顺德'],
    seoDesc: `新大物流赣州到中山、顺德物流专线，当天发货次日到达，顺德容桂德丰物流园直营网点覆盖两地，太平洋保险承保，支持代收货款。询价：${COMPANY.hotline}`,
    conclusion: [
      '时效：当天发货，次日到达中山、顺德',
      '发车：赣州↔珠三角往返天天发车，点对点直达不中转',
      '到达：佛山顺德容桂德丰物流园直营网点，覆盖中山、顺德两地提货派送',
    ],
    facts: [
      { label: '运输时效', value: '当天发货，次日到达' },
      { label: '发车频次', value: '天天发车（往返班线）' },
      { label: '上门取货', value: '接到委托1小时内上门' },
      { label: '货物保险', value: '中国太平洋财产保险承保' },
      { label: '询价热线', value: COMPANY.hotline },
    ],
    fromBranches: [
      { name: '新大物流（赣州总部）', address: COMPANY.headquarters, phone: COMPANY.hotline },
      toBranchVO('赣州五龙'),
      toBranchVO('赣州建材'),
    ],
    toBranches: [toBranchVO('中山顺德')],
    services: [
      {
        title: '整车运输',
        desc: '赣州↔中山顺德往返整车，天天发车准时准点',
        points: ['自有8部大型货车、合约车辆百余部', '当天装车当天发运', '点对点直达，中途不中转'],
      },
      {
        title: '零担配送',
        desc: '小批量货物按需配载，灵活经济',
        points: ['1小时内上门取货', '轻拿轻放、稳固码放', '到货电话通知，准时派送上门', '代收货款，异地结算'],
      },
      {
        title: '仓储中转',
        desc: '5600㎡+仓库，24小时仓储中转',
        points: ['企业、工厂、商场货物全天候托管', '中转配送一站式完成'],
      },
    ],
    faqs: stdFaqs('赣州', '中山顺德'),
  },
  {
    slug: 'nankang-furniture-guangdong',
    title: '南康到广东家具运输专线',
    origin: '南康',
    dest: '广东（广州/佛山/中山/顺德）',
    areaServed: ['南康', '广州', '佛山', '中山', '顺德'],
    seoDesc: `新大物流南康到广东家具运输专线，南康家具产业集散地直提直送，当天发货次日到达，家具简单拆装、提货送货到楼下，入户按送装计费，破损按价理赔。询价：${COMPANY.hotline}`,
    conclusion: [
      '时效：南康当天装运发货，次日到达广州、佛山、中山、顺德',
      '专业：南康家具产业集散地直提直送，减少中转损耗',
      '提送：提货送货到楼下，入户按送装另计（视路程与货量）',
    ],
    facts: [
      { label: '运输时效', value: '当天发货，次日到达' },
      { label: '提送方式', value: '直提直送，送货到楼下；入户按送装另计' },
      { label: '包装说明', value: '不直接提供包装，可推荐合作包装企业完成家具、设备打包，也可发货前自行妥善包装' },
      { label: '增值服务', value: '送货前简单拆装不收费、预约时间配送' },
      { label: '货物保险', value: '太平洋保险承保，破损按价理赔' },
      { label: '询价热线', value: COMPANY.hotline },
    ],
    fromBranches: [toBranchVO('南康')],
    toBranches: [toBranchVO('广州'), toBranchVO('佛山'), toBranchVO('中山顺德')],
    services: [
      {
        title: '家具专线运输',
        desc: '南康↔广东家具专线，专业团队护航',
        points: [
          '不直接提供包装，可推荐合作包装企业完成家具、设备打包',
          '轻拿轻放、分类码放，车厢内铺垫保护毯',
          '南康家具产业集散地直提直送，减少中转损耗',
          '全程货物保险，破损按价理赔',
        ],
      },
      {
        title: '拆装与提送',
        desc: '简单拆装免费，入户送装按路程货量计费',
        points: ['送货前简单拆装不收费', '提货送货到楼下', '入户需按送装另计（如白云区通常100元/次，量多另计）'],
      },
    ],
    faqs: [
      {
        q: '南康家具发到广东要多久？',
        a: `新大物流南康到广东家具专线当天发货、次日到达，覆盖广州、佛山、中山、顺德。从南康家具产业集散地直提直送，直达广东各直营网点后安排送货上门。`,
      },
      {
        q: '家具运输怎么包装才安全？',
        a: '本专线不直接提供包装业务，可推荐合作包装企业完成家具、设备打包；也可在发货前用珍珠棉、护角等将家具妥善包装。装车时我们会轻拿轻放、分类码放并在车厢铺垫保护毯，尽量减少运输磕碰。',
      },
      {
        q: '家具运费怎么计算？',
        a: `家具运费按体积、件数和包装要求综合计算，拆装、送货入户等服务项目单独计费。拨打新大物流询价热线${COMPANY.hotline}，报出家具品名和件数即可获取报价。`,
      },
      {
        q: '家具到了广东能送货入户并安装吗？',
        a: '货车可送至收货地址楼下；如需搬入室内并安装，属送装服务，按送货路程和货量另行计费（例如白云区范围内通常100元/次，量多另计），可提前预约。',
      },
      {
        q: '家具在运输中损坏了怎么办？',
        a: '新大物流所有货物由中国太平洋财产保险承保，运输中出现破损可按保险额度按价理赔。建议发货时购买足额保险，到货先验货再签收。',
      },
    ],
  },
];

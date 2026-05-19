// 公司基础信息
export const COMPANY = {
  name: '新大物流',
  fullName: '赣州新大物流有限公司',
  shortName: '新大物流',
  slogan: '踏踏实实做人，认认真真做事',
  desc: '赣州↔广东专线 · 当天发货 · 次日到达',
  hotline: '15717088088',
  domain: 'xinda56.cn',
  email: 'zengxiao@xinda56.cn',
  icp: '赣ICP备XXXXXXXX号',
  wechat: '新大物流',
  headquarters: '赣州经济技术开发区犹江路新大物流',
} as const;

// 服务理念
export const PHILOSOPHY = {
  mission: '为客户提供安全、快捷、可靠的物流服务',
  vision: '打造赣粤专线领先的现代化品牌物流企业',
  value: '客户至上，诚信经营',
  motto: '踏踏实实做人，认认真真做事',
} as const;

// 核心数据
export const STATS = [
  { label: '服务车辆', value: '185+', suffix: '辆', icon: 'truck' },
  { label: '直营网点', value: '6', suffix: '城直达', icon: 'network' },
  { label: '行业经验', value: '20+', suffix: '年', icon: 'experience' },
  { label: '客户满意', value: '99', suffix: '%', icon: 'satisfaction' },
] as const;

// 核心优势
export const ADVANTAGES = [
  {
    title: '运力雄厚',
    desc: '自有及合约车辆185台，收发货场地1000㎡+，仓储面积5600㎡+',
    icon: 'truck',
  },
  {
    title: '网络覆盖',
    desc: '赣州、南康、广州、佛山、中山、顺德六地直营网点，往返天天发车',
    icon: 'network',
  },
  {
    title: '速度领先',
    desc: '今天发货，明天到达。当天上站、当天发车，准时高效',
    icon: 'speed',
  },
  {
    title: '保障齐全',
    desc: '中国太平洋保险承保，贵重物品专人押运，全程信息跟踪反馈',
    icon: 'shield',
  },
] as const;

// 服务项目
export const SERVICES = [
  {
    title: '整车运输',
    desc: '赣州↔广东往返整车运输，天天发车，准时准点',
    details: [
      '自有8部大型新货车，合约车辆百余部',
      '当天装车，当天发运',
      '点对点直达，中途不中转',
      '可预约保险，全程无忧',
    ],
    icon: 'truck',
  },
  {
    title: '零担配送',
    desc: '灵活高效的零担物流服务，按需配载',
    details: [
      '1小时内上门取货',
      '专业包装加固',
      '到货电话通知，准时派送上门',
      '代收货款，异地结算',
    ],
    icon: 'package',
  },
  {
    title: '仓储服务',
    desc: '5600㎡+专业仓库，24小时仓储中转',
    details: [
      '专用货物存放仓库5600㎡+',
      '24小时仓储管理服务',
      '中转配送一站式完成',
      '企业、工厂、商场货物全天候托管',
    ],
    icon: 'warehouse',
  },
  {
    title: '家具运输',
    desc: '南康↔广东家具专线运输，专业团队护航',
    details: [
      '专业EPE珍珠棉、气泡膜多层包装，护角加固防刮防撞',
      '提供家具拆装服务，到货可预约专业组装',
      '轻拿轻放、分类码放，车厢内铺垫保护毯',
      '南康家具产业集散地直提直送，减少中转损耗',
      '全程货物保险，破损按价理赔',
      '送货入户，可预约指定时间配送',
    ],
    icon: 'package',
  },
] as const;

// 增值服务
export const VALUE_ADDED_SERVICES = [
  { title: '上门取货', desc: '接到委托1小时内上门' },
  { title: '专业包装', desc: '严格按要求进行包装加固' },
  { title: '代收货款', desc: '支持异地结算、月结' },
  { title: '专人押运', desc: '贵重物品全程专人看护' },
  { title: '货物保险', desc: '太平洋保险公司承保' },
  { title: '信息跟踪', desc: '全程信息反馈，到货通知' },
] as const;

// 网点信息
export const BRANCHES = [
  {
    city: '广州',
    address: '广州石井镇凰岗村凤鸣大道海晟明物流市场F档后一排156-166号',
    phone: '020-86402195',
    contact: '曾先生',
  },
  {
    city: '中山顺德',
    address: '佛山市顺德区容桂镇德丰物流园一期D05档（容桂客运站旁）',
    phone: '0757-29293868',
    contact: '刘先生',
  },
  {
    city: '佛山',
    address: '佛山市禅城区南庄镇易运物流市场二期D3栋16-17号',
    phone: '0757-85579298',
    contact: '蒋先生',
  },
  {
    city: '南康',
    address: '南康市龙岭工业园板材城华西6栋101、102、145、146、148号',
    phone: '0797-8370223',
    contact: '许先生',
  },
  {
    city: '赣州五龙',
    address: '赣州市章贡区沙河镇323国道旁红土地物流园D4区05-07号',
    phone: '0797-8284800',
    contact: '蔡女士',
  },
  {
    city: '赣州建材',
    address: '赣州市经济技术开发区犹江路（赣州市建材市场后面）',
    phone: '0797-8197320',
    contact: '郭先生',
  },
] as const;

// 发展历程
export const TIMELINE = [
  { year: '1998年', event: '开始经营广东物流落货业务' },
  { year: '2004年', event: '开始经营赣州—广东货运业务，奠定赣粤专线基础' },
  { year: '2005-2008年', event: '逐步在广州、佛山、中山、顺德设立分公司，六地直营网络成型' },
  { year: '2011年', event: '赣州市南康区新大物流有限公司正式注册成立' },
  { year: '2016-2018年', event: '购置8部大型货车，签约百余部社会车辆，运力大幅提升' },
  { year: '2019-2023年', event: '各门市扩大门面仓库，完善管理制度，团队素质持续提升' },
  { year: '2024年至今', event: '持续改革扩展，致力于打造现代化的品牌物流企业' },
] as const;

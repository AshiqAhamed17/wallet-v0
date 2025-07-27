import NavTabs from '@/components/common/NavTabs'
import { transactionNavItems } from '@/components/sidebar/SidebarNavigation/config'

const TxNavigation = () => {
  return <NavTabs tabs={transactionNavItems} />
}

export default TxNavigation

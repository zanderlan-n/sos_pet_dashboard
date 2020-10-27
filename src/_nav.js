import useSession from './hooks/useSession';

const NavMenu = () => {
  const { user } = useSession();

  const nav = {
    items: [
      {
        title: true,
        name: 'Menu',
      },

      {
        name: 'Pets',
        url: '/pets',
        icon: 'icon-notebook',
      },
      {
        name: 'Minha Conta',
        url: '/user',
        icon: 'icon-user',
      },
      {
        name: 'Sessões',
        url: '/meetings',
        icon: 'icon-notebook',
      },
      {
        name: 'Inscrições',
        url: '/subscriptions',
        icon: 'fa fa-address-book',
      },
    ],
  };

  user?.isAdmin &&
    nav.items.push(
      {
        name: 'Administradores',
        url: '/admins',
        icon: 'fa fa-gear',
      },
      {
        name: 'Logs',
        url: '/logs',
        icon: 'fa fa-list-alt ',
      }
    );
  return nav;
};

export default NavMenu;

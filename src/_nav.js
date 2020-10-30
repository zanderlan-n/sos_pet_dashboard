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
        icon: 'fa fa-paw',
      },
      {
        name: 'Minha Conta',
        url: '/user',
        icon: 'icon-user',
      },
      {
        name: 'Meus Pets',
        url: '/my_pets',
        icon: 'icon-user',
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

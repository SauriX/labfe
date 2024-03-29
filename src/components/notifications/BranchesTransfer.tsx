import { Tooltip, Transfer, Tree } from "antd";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useState } from "react";
import { TreeData } from "../../app/models/shared";
import {
  IUserForm,
  IUserPermission,
  UserFormValues,
} from "../../app/models/user";
import {
  convertToTreeDataBranch,
  onTreeSearch,
  onTreeSelectChangeBranch,
} from "./utils";
import { useSearchParams } from "react-router-dom";
import { DataNode } from "antd/lib/tree";
import { useStore } from "../../app/stores/store";
import IconSelector from "../../app/common/icons/IconSelector";

type BranchesPermissionsTypes = {
  id: any;
  sucursales: string[];
  sucursalesNotificacion: string[];
  setSucursales: React.Dispatch<React.SetStateAction<string[]>>;
};

const BranchesTransfer = ({
  id,
  sucursales,
  sucursalesNotificacion,
  setSucursales,
}: BranchesPermissionsTypes) => {
  const { optionStore, userStore } = useStore();
  const { setSucursalesId } = userStore;
  const { getBranchCityOptions, branchCityOptions } = optionStore;
  const [permissionsAvailableFiltered, setPermissionsAvailableFiltered] =
    useState<TreeData[]>([]);
  const [permissionsAdded, setPermissionsAdded] = useState<TreeData[]>([]);
  const [permissionsAvailable, setPermissionsAvailable] = useState<TreeData[]>(
    []
  );
  const [permissionsAddedFiltered, setPermissionsAddedFiltered] = useState<
    TreeData[]
  >([]);

  const [targetKeys, setTargetKeys] = useState<string[]>([]);

  let user: IUserForm = new UserFormValues();
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [disabled, setDisabled] = useState(true);
  const [searchParams] = useSearchParams();
  const [values, setValues] = useState<any[]>([]);
  const [treeInfo, setTreeInfo] = useState<any[]>([]);

  useEffect(() => {
    if (sucursalesNotificacion && id) {
      let sucursalesConjunto = [...sucursalesNotificacion];

      sucursalesConjunto = sucursalesConjunto.filter(
        (item, index) => sucursalesConjunto.indexOf(item) === index
      );
      setTargetKeys((original) => [...original, ...sucursalesConjunto]);
    }
  }, [sucursalesNotificacion]);
  const transform = useMemo(
    () =>
      convertToTreeDataBranch(
        targetKeys,
        setPermissionsAdded,
        setPermissionsAvailable,
        setPermissionsAddedFiltered,
        setPermissionsAvailableFiltered
      ),
    [targetKeys]
  );

  useEffect(() => {
    setSucursalesId(targetKeys);
  }, [targetKeys]);
  useEffect(() => {
    setValues(
      branchCityOptions.map((x) => ({
        title: "" + x.value,
        key: "" + x.value,
        icon: <IconSelector name={"" + x.value} />,
        children: x.options?.map((y) => ({
          key: "" + y.value,
          title: "" + y.label,
        })),
      }))
    );
  }, [branchCityOptions]);
  useEffect(() => {}, [permissionsAvailableFiltered]);
  useEffect(() => {
    transform(
      branchCityOptions.map((x) => ({
        title: "" + x.value,
        key: "" + x.value,
        icon: <IconSelector name={"" + x.value} />,
        children: x.options?.map((y) => ({
          key: "" + y.value,
          title: "" + y.label,
        })),
      })) ?? []
    );
  }, [values, targetKeys, transform]);
  const onSearch = onTreeSearch(
    setPermissionsAvailableFiltered,
    permissionsAvailable,
    setPermissionsAddedFiltered,
    permissionsAdded
  );

  useEffect(() => {
    if (values) {
      transform(values ?? []);
    }
  }, [values, targetKeys, transform]);
  const filterDataTree = (
    keys: string[],
    halfKeys: any,
    rootNode: TreeData[]
  ) => {
    let dataTreeTemp: TreeData[] = [];

    rootNode.forEach((node) => {
      let copy = { ...node };
      copy.children = copy.children?.filter((x) => keys.includes(x.key));
      if (!!copy.children?.length) {
        dataTreeTemp.push(copy);
      }
    });

    return dataTreeTemp;
  };
  const filterDataTreeRemove = (
    keys: string[],
    halfKeys: any,
    rootNode: TreeData[]
  ) => {
    let dataTreeTemp: TreeData[] = [];

    rootNode.forEach((node) => {
      let copy = { ...node };
      copy.children = copy.children?.filter((x) => !keys.includes(x.key));
      if (!!copy.children?.length) {
        dataTreeTemp.push(copy);
      }
    });

    return dataTreeTemp;
  };
  const onChange = (nextTargetKeys: string[]) => {
    setTargetKeys(nextTargetKeys.sort((a, b) => a.length - b.length));
    setSucursales(nextTargetKeys.sort((a, b) => a.length - b.length));
  };
  useEffect(() => {}, [targetKeys]);
  const filterOption = (inputValue: string, option: IUserPermission) => {
    return (
      option.menu.toLowerCase().indexOf(inputValue.toLowerCase()) > -1 ||
      option.permiso.toLowerCase().indexOf(inputValue.toLowerCase()) > -1
    );
  };
  const onSelectChange = onTreeSelectChangeBranch(
    permissionsAvailableFiltered,
    permissionsAddedFiltered,
    user,
    targetKeys,
    setSelectedKeys
  );

  const CheckReadOnly = () => {
    let result = false;
    const mode = searchParams.get("mode");
    if (mode == "ReadOnly") {
      result = true;
    }
    return result;
  };

  const onDeselectParent = (key: string | number, children: DataNode[]) => {
    setSelectedKeys(
      selectedKeys.filter((x) => !children.map((y) => y.key).includes(x))
    );
  };

  const onSelectParent = (key: string | number, children: DataNode[]) => {
    setSelectedKeys([
      ...selectedKeys,
      ...children.map((y) => y.key.toString()),
    ]);
  };
  useEffect(() => {}, [id]);
  useEffect(() => {
    getBranchCityOptions();
  }, []);

  useEffect(() => {
    const menusAvailable: TreeData[] = branchCityOptions.map((x) => ({
      title: "" + x.value,
      key: "" + x.value,
      icon: <IconSelector name={"" + x.value} />,
      children: x.options?.map((y) => ({
        key: "" + y.value,
        title: "" + y.label,
      })),
    }));
    setTreeInfo(menusAvailable);
    // setPermissionsAddedFiltered(menusAvailable);
    setPermissionsAvailableFiltered(menusAvailable);
  }, [branchCityOptions]);
  return (
    <>
      <Transfer<any>
        // dataSource={values.permisos}
        dataSource={branchCityOptions.map((x) => ({
          title: "" + x.value,
          key: "" + x.value,
          icon: <IconSelector name={"" + x.value} />,
          children: x.options?.map((y) => ({
            key: "" + y.value,
            title: "" + y.label,
          })),
        }))}
        showSearch
        onSearch={onSearch}
        onChange={onChange}
        style={{ justifyContent: "flex-end" }}
        listStyle={{
          width: 300,
          height: 300,
        }}
        rowKey={(x) => x.key.toString()}
        titles={[
          <Tooltip title="Sucursales que pueden ser asignadas">
            Disponibles
          </Tooltip>,
          <Tooltip title="Sucursales asignadas al tipo de usuario">
            Agregadas
          </Tooltip>,
        ]}
        filterOption={filterOption}
        targetKeys={targetKeys}
        selectedKeys={selectedKeys}
        onSelectChange={(
          sourceSelectedKeys: string[],
          targetSelectedKeys: string[]
        ) => {
          onSelectChange(sourceSelectedKeys, targetSelectedKeys);
          setDisabled(false);
        }}
        disabled={CheckReadOnly()}
      >
        {({ direction, onItemSelect, selectedKeys, filteredItems }) => {
          const data =
            direction === "left"
              ? permissionsAvailableFiltered
              : permissionsAddedFiltered;
          const checkedKeys = [...selectedKeys];
          return (
            <Tree
              virtual={false}
              checkable={!CheckReadOnly()}
              disabled={CheckReadOnly()}
              height={200}
              onCheck={(_, { node: { key, children, checked } }) => {
                if (children && children.length > 0 && checked) {
                  onDeselectParent(key, children);
                } else if (children && children.length > 0) {
                  onSelectParent(key, children);
                } else {
                  onItemSelect(key.toString(), !checked);
                }
                setDisabled(false);
              }}
              onSelect={(_, { node: { key, checked, children } }) => {
                if (children && children.length > 0 && checked) {
                  onDeselectParent(key, children);
                } else if (children && children.length > 0) {
                  onSelectParent(key, children);
                } else {
                  onItemSelect(key.toString(), !checked);
                }
                setDisabled(false);
              }}
              treeData={data}
              showIcon
              checkedKeys={checkedKeys}
            />
          );
        }}
      </Transfer>
    </>
  );
};

export default observer(BranchesTransfer);

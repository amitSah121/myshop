import 'package:everestmart/drawer.dart';
import 'package:flutter/material.dart';

class SettingsPage extends StatefulWidget {
  const SettingsPage({super.key});

  @override
  State<SettingsPage> createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  bool darkMode = false;
  bool notifications = true;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Settings'),
      ),
      drawer: buildAppDrawer(context),
      body: ListView(
        children: [
          SwitchListTile(
            title: const Text('Dark Mode'),
            value: darkMode,
            onChanged: (value) {
              setState(() => darkMode = value);
            },
          ),

          SwitchListTile(
            title: const Text('Notifications'),
            value: notifications,
            onChanged: (value) {
              setState(() => notifications = value);
            },
          ),

          const Divider(),

          const ListTile(
            leading: Icon(Icons.info_outline),
            title: Text('App Version'),
            subtitle: Text('EverestMart v1.0.0'),
          ),
        ],
      ),
    );
  }
}

import 'package:flutter/material.dart';

class AuthLoadingOverlay extends StatelessWidget {
  final bool isLoading;
  final Widget child;

  const AuthLoadingOverlay({
    super.key,
    required this.isLoading,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        child,
        if (isLoading)
          Container(
            color: Colors.black45,
            child: const Center(
              child: CircularProgressIndicator(),
            ),
          ),
      ],
    );
  }
}
